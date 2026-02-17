"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, ExternalLink } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  content: string;
  link: string | null;
  created_at: string;
  directory?: {
    name?: string;
    department?: string;
  } | null;
};

interface AnnouncementListProps {
  refreshTrigger?: number;
  isWidget?: boolean;
}

export default function AnnouncementList({ refreshTrigger, isWidget = false }: AnnouncementListProps) {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("announcements")
      .select(`*, directory ( name, department )`)
      .order("created_at", { ascending: false });

    if (isWidget) query = query.limit(3);

    const { data, error } = await query;

    if (error) console.error("Error fetching announcements:", error);
    else setList((data as Announcement[]) || []);

    setLoading(false);
  }, [isWidget]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements, refreshTrigger]);

  if (loading) return <p className="text-center text-gray-400 py-10">Loading updates...</p>;

  return (
    <div className="space-y-3 pr-2 custom-scrollbar h-full overflow-y-auto">
      {list.length === 0 && (
        <div className="text-center py-10 flex items-center justify-center text-gray-400">
          <p>No announcements yet.</p>
        </div>
      )}

      {list.map((item) => (
        <div
          key={item.id}
          className={`transition-all duration-200 border ${
            isWidget
              ? "bg-blue-50/50 p-4 rounded-xl border-blue-100 hover:border-blue-200"
              : "bg-white p-6 rounded-2xl border-gray-200 hover:shadow-md"
          }`}
        >
          <div className="flex flex-col gap-1">
            <h4 className={`font-bold text-gray-900 ${isWidget ? "text-sm" : "text-xl mb-2"}`}>{item.title}</h4>

            <p className={`text-gray-600 ${isWidget ? "text-xs line-clamp-2 mt-1" : "text-base leading-relaxed whitespace-pre-wrap"}`}>
              {item.content}
            </p>

            {item.link && (
              <div className={`flex ${isWidget ? "mt-2" : "mt-4"}`}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors ${
                    isWidget ? "text-xs" : "text-sm bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 hover:bg-blue-100"
                  }`}
                >
                  <ExternalLink className={isWidget ? "w-3 h-3" : "w-4 h-4"} />
                  {isWidget ? "Open Link" : "View Attachment / Link"}
                </a>
              </div>
            )}

            {!isWidget && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700">{item.directory?.name || "Faculty"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
