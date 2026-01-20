"use client";

import { useEffect, useState } from "react";
import { MarketplaceItem } from "@/types/marketplace"; 

// 1. Update the Props Interface
interface MarketListProps {
  currentUserEmail?: string; // Made optional
  isWidget?: boolean;        // New prop
}

export default function MarketList({ currentUserEmail, isWidget = false }: MarketListProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/marketplace");
      const data = await res.json();
      
      let fetchedItems = data.listings || [];

      // 2. If used as a widget, only show the top 4 items
      if (isWidget) {
        fetchedItems = fetchedItems.slice(0, 4);
      }

      setItems(fetchedItems);
    } catch (error) {
      console.error("Failed to load marketplace items", error);
    } finally {
      setLoading(false);
    }
  }

  async function markSold(id: string) {
    if (!confirm("Are you sure you want to mark this item as sold?")) return;

    try {
      const res = await fetch("/api/marketplace/sold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        load(); 
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      alert("Network error.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="text-gray-500 text-center animate-pulse">Loading listings...</p>;

  if (items.length === 0) return <p className="text-gray-500 text-center">No items found.</p>;

  return (
    // 3. Adjust Grid based on Widget mode (2 cols for widget, dynamic for full page)
    <div className={`grid gap-4 ${isWidget ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`border border-gray-200 p-5 rounded-lg shadow-sm transition relative overflow-hidden ${
            item.is_sold ? "bg-gray-50 opacity-80" : "bg-white hover:shadow-md"
          }`}
        >
          {/* Status Badge */}
          <div className="flex justify-between items-start">
            <h2 className="font-bold text-lg text-black truncate w-3/4">{item.product_title}</h2>
            {item.is_sold ? (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                Sold
              </span>
            ) : (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                Active
              </span>
            )}
          </div>

          <p className="font-semibold text-2xl mt-2 text-blue-600">₹{item.price}</p>
          <p className="text-gray-600 mt-2 text-sm line-clamp-2">{item.description}</p>
          
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 space-y-1">
            <p>👤 {item.owner_name}</p>
            {/* Hide phone number on widget to save space, or keep it if you prefer */}
            {!isWidget && <p>📞 {item.contact_info}</p>}
          </div>

          {/* Owner Actions (Only show if email matches AND we have the email) */}
          {!item.is_sold && currentUserEmail && item.owner_email === currentUserEmail && (
            <button
              className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium px-4 py-2 rounded-lg transition text-sm"
              onClick={() => markSold(item.id)}
            >
              Mark as Sold
            </button>
          )}
        </div>
      ))}
    </div>
  );
}