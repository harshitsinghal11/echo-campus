"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, X, UploadCloud } from "lucide-react";

export default function LostFoundForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location_found: "",
    contact_info: "",
    image_url: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      alert("Image too large! Please select an image under 200KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, image_url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Session expired. Please login again.");
        return;
      }

      const { error } = await supabase.from("lost_found").insert({
        user_id: user.id,
        title: form.title,
        description: form.description,
        location_found: form.location_found,
        contact_info: form.contact_info,
        image_url: form.image_url,
        is_resolved: false
      });

      if (error) throw error;

      alert("Lost Item Reported Successfully!");
      setForm({ title: "", description: "", location_found: "", contact_info: "", image_url: "" });
      onSuccess();

    } catch (err: any) {
      // --- HERE IS THE UPDATE ---
      // Catch the specific trigger error from Supabase
      if (err.message && err.message.includes("Daily limit reached")) {
        alert("Limit Reached: You can only post 2 items every 24 hours. Please try again tomorrow.");
      } else {
        alert("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... (Rest of your JSX remains exactly the same) ... */}
      {/* Image Preview */}
      <div className="w-full">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Item Photo</label>
        {form.image_url ? (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group">
            <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setForm({ ...form, image_url: "" })}
              className="absolute top-2 right-2 bg-white/90 text-red-600 p-1.5 rounded-full hover:bg-red-50 transition shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <p className="text-sm text-gray-500 font-medium">Click to upload photo</p>
              <p className="text-xs text-gray-400 mt-1">(Max 200KB)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">What was lost?</label>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Realme TWS" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-medium" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Location</label>
          <input required value={form.location_found} onChange={(e) => setForm({ ...form, location_found: e.target.value })} placeholder="e.g. Library" className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            Mobile Number
          </label>
          <input
            required
            type="tel"
            value={form.contact_info}
            onChange={(e) => {
              const value = e.target.value;
              // Only update if value is empty OR (contains only numbers AND is <= 10 digits)
              if (value === "" || (/^\d+$/.test(value) && value.length <= 10)) {
                setForm({ ...form, contact_info: value });
              }
            }}
            placeholder="e.g. 9211xx"
            className="w-full p-3 bg-gray-50 border text-gray-900 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
        <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Provide details (color, brand, scratches)..." className="w-full p-3 bg-gray-50 border text-gray-900 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm resize-none" />
      </div>

      <button disabled={loading} className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Report"}
      </button>
    </form>
  );
}