import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type MarketplaceListingRow = {
  id: string;
  owner_id: string;
  owner_name: string | null;
  owner_email: string | null;
  product_title: string;
  description: string;
  price: number;
  contact_info: string;
  is_sold: boolean;
  created_at: string;
};

type MarketplaceInsertPayload = {
  product_title?: string;
  description?: string;
  price?: number | string;
  owner_name?: string;
  contact_info?: string;
};

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
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map the data so the frontend gets a clean object
  const listings = ((data ?? []) as MarketplaceListingRow[]).map((item) => ({
    ...item,
    owner_email: item.owner_email || "",
    owner_name: item.owner_name || "Unknown Seller",
    contact_info: item.contact_info || "",
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

    const body = (await req.json()) as MarketplaceInsertPayload;
    const productTitle = body.product_title?.trim();
    const description = body.description?.trim();
    const ownerName = body.owner_name?.trim();
    const contactInfo = body.contact_info?.trim();
    const parsedPrice = Number(body.price);
    const ownerEmail = user.email?.trim();

    // Validate all required fields before insert
    if (!productTitle || !description || !ownerName || !contactInfo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    if (!ownerEmail) {
      return NextResponse.json({ error: "User email unavailable" }, { status: 400 });
    }

    if (!/^\d{10}$/.test(contactInfo)) {
      return NextResponse.json({ error: "Contact info must be 10 digits" }, { status: 400 });
    }

    if (description.length < 3) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Never trust owner_email from client input; derive from authenticated user
    const { error: insertError } = await supabase.from("marketplace").insert({
      owner_id: user.id,
      product_title: productTitle,
      description,
      price: parsedPrice,
      owner_name: ownerName,
      contact_info: contactInfo,
      owner_email: ownerEmail,
      is_sold: false,
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
