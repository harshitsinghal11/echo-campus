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
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { }
        },
      },
    }
  );
}

// GET: Fetch Listings
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketplace")
    .select(`
      *,
      users:owner_id ( 
        email 
      )
    `) // Do NOT put owner_name inside the parenthesis; it belongs to marketplace (*)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map the data so the frontend gets a clean object
  const listings = (data as any[]).map((item) => ({
    ...item,
    owner_email: item.users?.email,
    owner_name: item.owner_name || "Unknown Seller", 
    contact_info: item.contact_info
  }));

  return NextResponse.json({ listings });
}
// POST: Create Listing
export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // 1. ADDED owner_name and contact_info here
    const { product_title, description, price, owner_name, contact_info, email} = body;

    // 2. Update validation to check for the new fields
    if (!product_title || !description || !price || !owner_name || !contact_info) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Insert into Supabase (Make sure these column names match your Supabase Table!)
    const { error: insertError } = await supabase.from("marketplace").insert({
      owner_id: user.id,
      product_title,
      description,
      price: Number(price),
      owner_name,    // Add this
      contact_info, 
      email, // Add this
      is_sold: false
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}