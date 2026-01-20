"use client";
import Link from "next/link";
import { Megaphone, BookUser, Camera, ArrowRight } from "lucide-react";

// Import your reusable components
import ComplaintList from "@/components/complaints/ComplaintList";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import LostFoundList from "@/components/shared/LostFound/LostFoundList";

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
      </div>

      {/* --- TOP ROW (Complaints & Announcements) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. STUDENT COMPLAINTS */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-lg font-bold text-gray-800">Student Complaints</h2>
            <Link href="/main/admin/complaints" className="text-sm text-blue-600 hover:underline">
              See all
            </Link>
          </div>
          {/* Reusable Component in Widget Mode */}
          <ComplaintList isWidget={true} />
        </section>

        {/* 2. LATEST ANNOUNCEMENTS */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-lg font-bold text-gray-800">Latest Announcements</h2>
            <Link href="/main/admin/announcements" className="text-sm text-blue-600 hover:underline">
              Manage
            </Link>
          </div>
          {/* Reusable Component in Widget Mode */}
          <AnnouncementList isWidget={true} />
        </section>

      </div>

      {/* --- BOTTOM ROW (Lost & Found + Quick Actions) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* 3.LOST ITEMS */}
        <section className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col h-[350px]">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-lg font-bold text-gray-800">Lost Items</h2>
            <Link href="/main/admin/lost-found" className="text-sm font-bold text-gray-900 flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Reusable Component (Search hidden) */}
          <LostFoundList showSearch={false} />
        </section>

        {/* 4. QUICKLY NAVIGATE (Static Actions) */}
        <section className="lg:col-span-2 bg-gray-100 rounded-2xl p-6 border border-gray-200 h-[350px] flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4 shrink-0">Quickly Navigate</h2>
          
          <div className="flex-1 flex flex-col gap-4">
            {/* Post Announcement */}
            <Link 
              href="/main/admin/announcements"
              className="flex items-center justify-between p-4 bg-gray-200 hover:bg-white hover:shadow-md transition rounded-xl border border-gray-300 group"
            >
              <span className="font-bold text-gray-800">Post a Announcement</span>
              <div className="p-2 bg-blue-600 rounded-lg text-white group-hover:scale-110 transition">
                <Megaphone className="w-5 h-5" />
              </div>
            </Link>

            {/* Icons Row */}
            <div className="bg-gray-200/50 rounded-xl p-4 border border-gray-300 flex-1 flex flex-col justify-center">
               <h3 className="text-sm font-bold text-gray-600 mb-4">Quick Actions</h3>
               <div className="flex gap-4 justify-around">
                 <Link href="/main/admin/directory" className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 group-hover:border-purple-300 transition">
                      <BookUser className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-600">Directory</span>
                 </Link>
                 <Link href="/main/admin/lost-found" className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 group-hover:border-teal-300 transition">
                      <Camera className="w-6 h-6 text-teal-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-600">Lost Items</span>
                 </Link>
               </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}