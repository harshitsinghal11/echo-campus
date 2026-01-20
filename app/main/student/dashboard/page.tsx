import Link from "next/link";
import { Megaphone, ShoppingBag, MessageSquare, AlertTriangle, Camera } from "lucide-react";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import MarketplaceList from "@/components/marketplace/MarketplaceList";
import ComplaintList from "@/components/complaints/ComplaintList";
import LostFoundList from "@/components/shared/LostFound/LostFoundList";

export const metadata = {
title: "Dashboard", // Result: "Dashboard | EchoCampus"
};
export default function StudentDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#f8f8f8] capitalize">
          Hey! Welcome To EchoCampus
        </h1>
      </div>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. LATEST ANNOUNCEMENTS (Full Width) */}
        <section className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Latest Announcements
            </h2>
            <Link href="/main/student/announcements" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {/* Reusable Component */}
          <AnnouncementList isWidget={true} />
        </section>

        {/* 2. NEWEST LISTINGS (Left 2/3) */}
        <section className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
              Newest Listings
            </h2>
            <Link href="/main/student/marketplace" className="text-sm text-purple-600 hover:underline">
              Browse Market
            </Link>
          </div>
          {/* Reusable Component */}
          <MarketplaceList isWidget={true} />
        </section>

        {/* 3. RIGHT COLUMN (Complaints + 2x2 Actions) */}
        <div className="space-y-6">

          {/* A. Top Complaints */}
          <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm min-h-[250px] flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Recent Complaints
            </h2>
            {/* Reusable Component */}
            <ComplaintList isWidget={true} />
          </section>

          {/* B. Quick Actions (Static Links) */}
          <section className="bg-gray-100 rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/main/student/marketplace" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 group">
                <ShoppingBag className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-gray-600 text-center">Sell Item</span>
              </Link>

              <Link href="/main/student/complaint" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 group">
                <AlertTriangle className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-gray-600 text-center">Complaint</span>
              </Link>

              <Link href="/main/student/chat" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 group">
                <MessageSquare className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-gray-600 text-center">Global Chat</span>
              </Link>

              <Link href="/main/student/lost-found" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 group">
                <Camera className="w-6 h-6 text-teal-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-gray-600 text-center">Lost & Found</span>
              </Link>
            </div>

          </section>

        </div>

        {/* 4. LOST & FOUND SECTION (Full Width at Bottom) */}
        <section className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-teal-600" />
              Recent Lost & Found
            </h2>
            <Link href="/main/student/lost-found" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          {/* Reusable Component (Search hidden) */}
          <LostFoundList showSearch={false} />
        </section>

      </div>
    </div>
  );
}