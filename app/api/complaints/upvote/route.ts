import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. Setup Client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {} 
        },
      }
    );

    const { complaintId, email } = await req.json();

    if (!complaintId || !email) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 2. Check for existing upvote
    const { data: existing } = await supabase
      .from("complaint_upvotes")
      .select("id")
      .eq("complaint_id", complaintId)
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: "Already upvoted" }, { status: 200 });
    }

    // 3. Insert Upvote
    const { error } = await supabase
      .from("complaint_upvotes")
      .insert({ complaint_id: complaintId, email });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Upvote added" }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}