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
        setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { } },
      },
    }
  );
}

// GET: Fetch Complaints
export async function GET() {
  const supabase = await createClient();

  // We join 'users' -> 'student_profiles' to get the session code safely
  const { data, error } = await supabase
    .from("complaint_box")
    .select(`
      id, 
      content, 
      created_at,
      is_anonymous,
      user_id,
      complaint_upvotes (count),
      users:user_id (
        student_profiles ( session_code )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Transform data
  const complaints = data.map((c: any) => {
    // Navigate the nested join: users -> student_profiles -> session_code
    const profile = Array.isArray(c.users?.student_profiles) 
      ? c.users?.student_profiles[0] 
      : c.users?.student_profiles;

    const realSessionCode = profile?.session_code || "Unknown";

    return {
      id: c.id,
      complaint: c.content, 
      created_at: c.created_at,
      session_code: c.is_anonymous ? "Anonymous" : realSessionCode,
      upvotes: c.complaint_upvotes[0]?.count || 0,
      current_user_has_upvoted: false // Frontend can handle this via separate check or improved query if needed
    };
  });

  return NextResponse.json({ complaints });
}

// POST: Create Complaint
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { complaint, isAnonymous } = body; 

    if (!complaint) {
      return NextResponse.json({ error: "Complaint content missing" }, { status: 400 });
    }
    
    // 2. Insert (RLS Policy will ensure only Students can do this)
    const { error: insertError } = await supabase
      .from("complaint_box")
      .insert({ 
        user_id: user.id,
        content: complaint,
        is_anonymous: isAnonymous || false
      });

    if (insertError) {
        if (insertError.message.includes("limit")) {
            return NextResponse.json({ error: "Daily limit reached! 1 Complaint per Week" }, { status: 400 });
        }
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}