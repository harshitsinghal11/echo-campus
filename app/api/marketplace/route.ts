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
      users:owner_id ( email, full_name )
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type MarketplaceRow = {
  users?: { email?: string; full_name?: string };
  [key: string]: unknown;
};

const listings = (data as MarketplaceRow[]).map((item) => ({
  ...item,
  owner_email: item.users?.email,
  owner_name: item.users?.full_name,
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
    const { product_title, description, price } = body;

    if (!product_title || !description || !price) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Insert Item (Using owner_id link)
    const { error: insertError } = await supabase.from("marketplace").insert({
      owner_id: user.id,
      title: product_title,
      description,
      price: Number(price),
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