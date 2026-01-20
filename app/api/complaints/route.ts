import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { }
        },
      },
    }
  );
}

// GET: Fetch Complaints (Unchanged)
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("complaint_box")
    .select(`
      id, 
      complaint, 
      created_at, 
      session_code,
      complaint_upvotes (count)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const complaints = data.map((c: any) => ({
    id: c.id,
    complaint: c.complaint,
    created_at: c.created_at,
    session_code: c.session_code,
    upvotes: c.complaint_upvotes[0]?.count || 0,
  }));

  return NextResponse.json({ complaints });
}

// POST: Create Complaint (Logic moved to DB Trigger)
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { sessionCode, complaint, email } = body;

    if (!sessionCode || !complaint || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // 1. Attempt Insert
    const { error: insertError } = await supabase
      .from("complaint_box")
      .insert({ 
        session_code: sessionCode, 
        complaint: complaint, 
        email: email 
      });

    // 2. Handle Errors (Including Trigger Exception)
    if (insertError) {
        // If the trigger blocks it, the error message will be:
        // "Weekly limit reached! You can only submit 1 complaint per week."
        
        // Check if it's our specific trigger error to return a 400 (Bad Request) instead of 500
        if (insertError.message.includes("Weekly limit reached")) {
            return NextResponse.json({ error: insertError.message }, { status: 400 });
        }

        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}