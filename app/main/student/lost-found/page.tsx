"use client";
import { useState } from "react";
import LostFoundForm from "@/components/shared/LostFound/LostFoundForm";
import LostFoundList from "@/components/shared/LostFound/LostFoundList";
import { Camera } from "lucide-react";

export default function LostFoundPage() {
  // This key forces the list to reload when a new item is added
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#f8f8f8]">Lost & Found</h1>
        <p className="text-gray-400 mt-1">Report items found on campus. Delete the post once claimed.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Feed */}
        <div className="lg:col-span-2">
          {/* Pass the refreshKey to trigger reload */}
          <LostFoundList refreshTrigger={refreshKey} />
        </div>
        
        {/* RIGHT COLUMN: Report Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Report an Item
            </h2>
            <LostFoundForm onSuccess={() => setRefreshKey(prev => prev + 1)} />
          </div>
        </div> 

      </div>
    </div>
  );
}