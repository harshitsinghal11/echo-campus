"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Send, Loader2, Link as LinkIcon } from "lucide-react";

export default function AnnouncementForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState(""); // New State for Link

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get Faculty ID
      const { data: facultyRow, error: facultyError } = await supabase
        .from("faculty_users")
        .select("faculty_id")
        .eq("user_id", user.id)
        .single();

      if (facultyError || !facultyRow) throw new Error("Faculty profile not found.");

      // Insert Announcement
      const { error: postError } = await supabase.from("announcements").insert({
        title,
        content,
        link: link || null, // If empty string, save as NULL
        author_id: facultyRow.faculty_id,
      });

      if (postError) throw postError;

      // Reset Form
      setTitle("");
      setContent("");
      setLink("");
      onSuccess();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to post.";
      alert(message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* 1. Title Input */}
      <div>
        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">
          Subject / Title
        </label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Exam Schedule Update"
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
        />
      </div>

      {/* 2. Link Input (NEW) */}
      <div>
        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">
          Attachment Link <span className="text-gray-400 font-normal lowercase">(optional)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LinkIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="forms.google.com/"
            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* 3. Content Textarea */}
      <div>
        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">
          Details
        </label>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your announcement content here..."
          rows={5}
          className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        disabled={loading}
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Publish Now</>}
      </button>
    </form>
  );
}