import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    
    // 1. Setup Client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) { 
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} 
          },
        },
      }
    );

    // 2. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { complaintId } = await req.json();
    if (!complaintId) {
      return NextResponse.json({ error: "Missing Complaint ID" }, { status: 400 });
    }

    // 3. CHECK: Does a vote already exist?
    const { data: existing, error: fetchError } = await supabase
      .from("complaint_upvotes")
      .select("id")
      .eq("complaint_id", complaintId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // 4. TOGGLE LOGIC
    if (existing) {
      // --- A. REMOVE VOTE (Toggle Off) ---
      const { error: deleteError } = await supabase
        .from("complaint_upvotes")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
         return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
      
      // Return added: false (Frontend should decrement count)
      return NextResponse.json({ message: "Upvote removed", added: false }, { status: 200 });

    } else {
      // --- B. ADD VOTE (Toggle On) ---
      const { error: insertError } = await supabase
        .from("complaint_upvotes")
        .insert({ 
          complaint_id: complaintId, 
          user_id: user.id 
        });

      if (insertError) {
        // Handle Policy Violations (e.g., Faculty trying to vote)
        if (insertError.code === '42501') {
           return NextResponse.json({ error: "Students only" }, { status: 403 });
        }
        // Handle Race Condition (Double click)
        if (insertError.code === '23505') { 
           return NextResponse.json({ message: "Already processed" }, { status: 200 });
        }
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      // Return added: true (Frontend should increment count)
      return NextResponse.json({ message: "Upvote added", added: true }, { status: 201 });
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}