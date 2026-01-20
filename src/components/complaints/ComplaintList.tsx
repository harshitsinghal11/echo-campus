'use client';
import { useEffect, useState } from "react";
import { ThumbsUp, MessageSquare, Clock } from "lucide-react";

type Complaint = {
  id: string;
  complaint: string;
  created_at: string;
  upvotes: number;
};

interface ComplaintListProps {
  userEmail?: string; // Optional because dashboard might not pass it immediately
  isWidget?: boolean; // NEW PROP
}

export default function ComplaintList({ userEmail, isWidget = false }: ComplaintListProps) {
  const [list, setList] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState<string | null>(null);

  async function load() {
    try {
      // Note: If you want server-side limiting, you'd update the API. 
      // For now, we fetch all and slice client-side for the widget.
      const res = await fetch("/api/complaints");
      const json = await res.json();
      let data = (json.complaints as Complaint[]) || [];
      
      // If Widget, only show Top 3
      if (isWidget) {
        data = data.slice(0, 3);
      }
      
      setList(data);
    } catch (error) {
      console.error("Failed to load complaints:", error);
    } finally {
      setLoading(false);
    }
  }

  async function upvote(id: string) {
    if (!userEmail) return alert("Please login to upvote.");
    setUpvoting(id);

    try {
      const res = await fetch("/api/complaints/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId: id, email: userEmail })
      });

      const data = await res.json();
      if (data.message === "Already upvoted") {
        alert("You already upvoted this complaint.");
      } else if (data.message === "Upvote added") {
        // alert("Upvote successful!"); // Optional: quieter UX
      }
      await load();
    } catch (error) {
      console.error("Failed to upvote:", error);
    } finally {
      setUpvoting(null);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-400 py-10">Loading complaints...</div>;
  }

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto ${isWidget ? '' : 'bg-gray-50 rounded-xl p-6'}`}>
      
      {/* HEADER: Only show if NOT a widget */}
      {!isWidget && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-black flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Live Complaints
          </h1>
          <p className="text-black mt-2">
            {list.length} {list.length === 1 ? 'complaint' : 'complaints'} from the community
          </p>
        </div>
      )}

      {list.length === 0 ? (
        <div className={`${isWidget ? 'h-full flex items-center justify-center' : 'bg-gray-50 rounded-xl p-6 text-center'}`}>
          {!isWidget && <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
          <p className="text-gray-500">No active complaints.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-blue-200 ${isWidget ? 'p-4' : 'p-4'}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className={`text-gray-800 font-medium leading-relaxed ${isWidget ? 'text-sm line-clamp-2' : 'text-lg'}`}>
                    "{c.complaint}"
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(c.created_at)}</span>
                  </div>
                </div>

                {/* Vote Button */}
                <button
                  onClick={() => upvote(c.id)}
                  disabled={upvoting === c.id}
                  className={`flex items-center gap-1 bg-orange-50 px-2 py-1.5 rounded-md border border-orange-100 hover:bg-orange-100 transition-colors disabled:opacity-50 ${isWidget ? '' : 'flex-col min-w-[60px]'}`}
                >
                   <span className={`text-sm font-bold text-orange-600 ${upvoting === c.id ? 'animate-pulse' : ''}`}>
                    {c.upvotes}
                  </span>
                  <ThumbsUp className={`w-3.5 h-3.5 text-orange-400 ${upvoting === c.id ? 'text-orange-600' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}