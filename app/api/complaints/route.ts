import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Helper to create client
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
                cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); 
            } catch { 
                // Ignored in server components/GET requests
            } 
        },
      },
    }
  );
}

// GET: Fetch Complaints
export async function GET() {
  const supabase = await createClient();

  // 1. Get Current User (needed to check if *they* upvoted)
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id || null;

  // 2. Build Query
  // We fetch global count, AND specific upvotes by this user to check "has_upvoted"
  let query = supabase
    .from("complaint_box")
    .select(`
      id, 
      content, 
      created_at,
      is_anonymous,
      user_id,
      complaint_upvotes(count),
      users:user_id (
        student_profiles ( session_code )
      )
    `)
    .order("created_at", { ascending: false });

  // If a user is logged in, we verify if they upvoted each complaint
  // We do this by a separate query or by fetching their specific vote id in the main query.
  // Limitation: Supabase complex filters in deep selects can be tricky.
  // Efficient workaround: Fetch user's upvotes ID list in parallel if logged in.
  
  let myUpvotedIds = new Set<string>();
  if (currentUserId) {
    const { data: myVotes } = await supabase
        .from("complaint_upvotes")
        .select("complaint_id")
        .eq("user_id", currentUserId);
    
    if (myVotes) {
        myVotes.forEach(v => myUpvotedIds.add(v.complaint_id));
    }
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 3. Transform data safely
  const complaints = (data as ComplaintRow[]).map((c) => {
    // Handle the array/object ambiguity for joins
    const userData = Array.isArray(c.users) ? c.users[0] : c.users;
    const profile = Array.isArray(userData?.student_profiles)
      ? userData?.student_profiles[0]
      : userData?.student_profiles;

    const realSessionCode = profile?.session_code || "Unknown";
    
    // SAFEGUARDS:
    // 1. If anonymous, do not send session_code (optional) or user_id back to client.
    // 2. Count extraction
    const upvoteCount = c.complaint_upvotes?.[0]?.count || 0;

    return {
      id: c.id,
      complaint: c.content,
      created_at: c.created_at,
      // Logic: If anonymous, mask the Session Code AND the User ID
      session_code: c.is_anonymous ? "Anonymous" : realSessionCode,
      // NEVER return the author's user_id if it is anonymous
      author_id: c.is_anonymous ? null : c.user_id,
      upvotes: upvoteCount,
      current_user_has_upvoted: myUpvotedIds.has(c.id),
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

    if (!complaint || typeof complaint !== 'string') {
      return NextResponse.json({ error: "Invalid complaint content" }, { status: 400 });
    }
    
    // 2. Insert
    const { error: insertError } = await supabase
      .from("complaint_box")
      .insert({ 
        user_id: user.id,
        content: complaint,
        is_anonymous: !!isAnonymous // Ensure boolean
      });

    if (insertError) {
        // Warning: Checking error string is fragile, but acceptable for simple apps
        if (insertError.message.toLowerCase().includes("limit") || insertError.code === "23505") { // 23505 is generic unique violation
            return NextResponse.json({ error: "Daily limit reached! 1 Complaint per Week" }, { status: 429 });
        }
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Updated Types to reflect Supabase returns
type ComplaintRow = {
  id: string;
  content: string;
  created_at: string;
  is_anonymous: boolean;
  user_id: string;
  complaint_upvotes?: { count: number }[] | null;
  users?: {
    student_profiles?: { session_code?: string } | { session_code?: string }[];
  } | {
    student_profiles?: { session_code?: string } | { session_code?: string }[];
  }[];
};