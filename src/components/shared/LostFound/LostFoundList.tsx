"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MapPin, Phone, Calendar, Search, Camera, Trash2, ArrowRight } from "lucide-react";

interface LostFoundListProps {
  refreshTrigger?: number;
  showSearch?: boolean; // If false, renders as a compact "Widget" for dashboards
}

export default function LostFoundList({ 
  refreshTrigger, 
  showSearch = true 
}: LostFoundListProps) {
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      let query = supabase
        .from("lost_found")
        .select("*")
        .order("created_at", { ascending: false });

      // In Widget mode (Dashboard), limit to top 3
      if (!showSearch) {
        query = query.limit(3);
      }

      const { data, error } = await query;
      if (!error) setItems(data || []);
      setLoading(false);
    }
    fetchItems();
  }, [refreshTrigger, internalRefresh, showSearch]);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Has this item been returned? This post will be deleted.");
    if (!confirm) return;

    const { error } = await supabase.from("lost_found").delete().eq("id", id);
    if (error) alert("Error: " + error.message);
    else setInternalRefresh(prev => prev + 1);
  };

  return (
    <div className={`space-y-6 ${!showSearch ? 'h-full flex flex-col' : ''}`}>
      
      {/* --- SEARCH BAR (Only if showSearch is true) --- */}
      {showSearch && (
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search lost items..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all" 
          />
        </div>
      )}

      {/* --- LOADING STATE --- */}
      {loading && <div className="text-center py-10 text-gray-400 text-sm animate-pulse">Loading feed...</div>}

      {/* --- EMPTY STATE --- */}
      {!loading && items.length === 0 && (
        <div className={`flex flex-col items-center justify-center text-center ${showSearch ? 'py-20' : 'flex-1'} bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-400`}>
          <Camera className="w-10 h-10 mb-2 opacity-20" />
          <p className="font-medium text-sm">No items found.</p>
        </div>
      )}

      {/* --- LIST LAYOUT --- */}
      <div className={
        !showSearch 
          ? "flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3" // Widget Mode: Vertical Stack
          : "grid grid-cols-1 gap-6" // Full Page Mode: Comfortable List
      }>
        
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`
              bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden
              ${!showSearch ? 'p-3 flex items-center gap-3' : 'p-5 flex flex-col md:flex-row gap-6'}
            `}
          >
            
            {/* 1. IMAGE THUMBNAIL */}
            <div className={`
              bg-gray-100 rounded-xl shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center relative
              ${!showSearch ? 'w-16 h-16' : 'w-full md:w-48 h-48'}
            `}>
              {item.image_url ? (
                <img src={item.image_url} alt="Item" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <Camera className={`text-gray-300 ${!showSearch ? 'w-6 h-6' : 'w-10 h-10'}`} />
              )}
            </div>

            {/* 2. CONTENT */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              
              {/* Header: Title + Date */}
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-bold text-gray-900 truncate pr-2 ${!showSearch ? 'text-sm' : 'text-xl'}`}>
                  {item.title}
                </h3>
                {/* Date Badge (Only visible on hover in widget mode, always visible in full mode) */}
                <span className={`
                  text-xs font-medium text-gray-400 flex items-center gap-1
                  ${!showSearch ? 'hidden' : 'bg-gray-50 px-2 py-1 rounded-lg'}
                `}>
                  <Calendar className="w-3 h-3" />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Location (Widget Only) */}
              {!showSearch && (
                 <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <MapPin className="w-3 h-3 text-blue-500" /> 
                    <span className="truncate">{item.location_found}</span>
                 </div>
              )}

              {/* Full Details (Full Page Only) */}
              {showSearch && (
                <>
                  <div className="flex flex-wrap gap-2 mb-3 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100/50">
                      <MapPin className="w-3.5 h-3.5" /> {item.location_found}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                      <Phone className="w-3.5 h-3.5" /> {item.contact_info}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                    {item.description || "No additional description."}
                  </p>

                  {/* Action Footer */}
                  {currentUserId === item.user_id && (
                    <div className="pt-4 border-t border-gray-50 flex justify-end">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Mark as Found / Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Widget Mode: Chevron for "Go" indication */}
            {!showSearch && (
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors mr-1" />
            )}

          </div>
        ))}
      </div>
    </div>
  );
}