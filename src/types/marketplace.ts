export type MarketplaceItem = {
  id: string;
  owner_id: string;      // Matches DB
  owner_name: string;    // Matches DB
  owner_email: string;   // Added to DB
  product_title: string; // Renamed in DB
  description: string;   // Matches DB
  price: number;         // Matches DB
  contact_info: string;  // Added to DB
  is_sold: boolean;      // Matches DB
  created_at: string;    // Matches DB
};