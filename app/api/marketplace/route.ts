import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Helper to create the client correctly in Next.js 15
async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}

// GET: Fetch Listings
export async function GET(req: Request) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketplace")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ listings: data });
}

// POST: Create Listing (Now Enforces 3-Day Limit)
export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Check Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth Error:", authError);
      return NextResponse.json({ error: "Unauthorized: You must be logged in." }, { status: 401 });
    }

    // 2. Parse Body
    const body = await req.json();
    const { product_title, description, price, contact_info, owner_name } = body;

    if (!product_title || !description || !price || !contact_info || !owner_name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 3. Check if User Exists in DB (Safety check)
    const { data: publicUser } = await supabase
      .from("student_users") 
      .select("id")
      .eq("id", user.id)
      .single();

    if (!publicUser) {
      return NextResponse.json(
        { error: "Profile not found. Please log out and log back in." },
        { status: 404 }
      );
    }

    // 4. Insert Item (Trigger will run here)
    const { error: insertError } = await supabase.from("marketplace").insert({
      owner_id: user.id,
      owner_email: user.email,
      owner_name: owner_name,
      product_title,
      description,
      price: Number(price),
      contact_info,
    });

    if (insertError) {
      // 5. Catch Trigger Exception
      // If the trigger blocks the insert, we send a 400 error to the frontend
      if (insertError.message.includes("Limit reached")) {
         return NextResponse.json(
            { error: insertError.message }, // "Limit reached! You can only list 1 item every 3 days."
            { status: 400 }
         );
      }

      console.error("Insert Error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("CRITICAL SERVER CRASH:", err);
    return NextResponse.json(
      { error: `Server Crash: ${err.message}` },
      { status: 500 }
    );
  }
}