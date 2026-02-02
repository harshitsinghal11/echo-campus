"use client";
import { useState } from "react";
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import { Megaphone, Activity, Radio } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-[#f8f8f8]">Announcement Center</h1>
        <p className="text-gray-300 mt-1">Manage campus-wide broadcasts and updates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Live Feed (66% Width) */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[600px] flex flex-col">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
                 <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                       <Radio className="w-5 h-5 text-blue-600" />
                       Live Broadcasts
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">History of posted announcements</p>
                 </div>
                 <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                    Live View
                 </span>
              </div>

              {/* Feed Content */}
              <div className="p-6 bg-gray-50/30 flex-1 rounded-b-2xl">
                 <AnnouncementList refreshTrigger={refreshKey} />
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: The Form Widget (33% Width) */}
        <div className="lg:col-span-1">
           <div className="sticky top-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                 
                 {/* The Blue Header Block (As per image) */}
                 <div className="bg-blue-600 p-6 text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                       <Megaphone className="w-5 h-5" />
                       Post Update
                    </h2>
                    <p className="text-blue-100 text-xs mt-1 leading-relaxed opacity-90">
                       This message will be instantly visible to all students.
                    </p>
                 </div>

                 {/* The Form */}
                 <div className="p-6">
                    <AnnouncementForm onSuccess={handleSuccess} />
                 </div>
              </div>

              {/* Optional Helper Card */}
              <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-blue-800 flex gap-3">
                 <Activity className="w-5 h-5 shrink-0" />
                 <p className="text-xs leading-relaxed">
                    <strong>Pro Tip:</strong> Keep titles short and concise. Check the "Live Broadcasts" list on the left to confirm your post appears correctly.
                 </p>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}