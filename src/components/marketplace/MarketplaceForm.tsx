"use client";

import React, { useState } from "react";
import { useUserEmail } from "@/hooks/useUserEmail";
import { useRouter } from "next/navigation";

export default function MarketCreateForm() {
  const userEmail = useUserEmail();
  const router = useRouter();
  
  const [errorMsg, setErrorMsg] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consolidated all fields into one state object
  const [form, setForm] = useState({
    product_title: "",
    description: "",
    price: "",
    owner_name: "", 
    contact_info: "",
  });

  // Added React.FormEvent type to fix the 'e' error
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); 
    setErrorMsg("");

    if (!form.owner_name) return setErrorMsg("Owner Name is required");
    if (!userEmail) return setErrorMsg("Email not loaded. Please wait.");
    if (form.contact_info.length !== 10) return setErrorMsg("Contact info must be 10 digits");

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email: userEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish item.");
      }

      alert("Item Published Successfully!");
      
      setForm({
        product_title: "",
        description: "",
        price: "",
        owner_name: "",
        contact_info: "",
      });
      
      router.refresh(); 

    } catch (error: any) {
      setErrorMsg(error.message || "Connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 text-black rounded-lg shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Trade Something?</h2>

      <input
        placeholder="Title"
        required
        value={form.product_title}
        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        onChange={(e) => setForm({ ...form, product_title: e.target.value })}
      />

      <textarea
        placeholder="Description"
        value={form.description}
        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
        rows={3}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <input
        type="text"
        inputMode="numeric"
        placeholder="Price (₹)"
        value={form.price}
        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        onChange={(e) => {
          const digitsOnly = e.target.value.replace(/\D/g, "");
          if (digitsOnly.length <= 6) setForm({ ...form, price: digitsOnly });
        }}
      />

      <input
        placeholder="Your Full Name"
        value={form.owner_name} 
        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
      />

      <input
        className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50 text-gray-500 cursor-not-allowed"
        value={userEmail || "Loading email..."}
        disabled 
      />

      <input
        type="tel"
        inputMode="numeric"
        placeholder="Contact No (10 digits)"
        value={form.contact_info}
        maxLength={10}
        className={`border rounded-lg p-3 w-full focus:outline-none focus:ring-2 transition ${
          form.contact_info.length > 0 && form.contact_info.length < 10
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
        onChange={(e) => {
          const digitsOnly = e.target.value.replace(/\D/g, "");
          setForm({ ...form, contact_info: digitsOnly });
        }}
      />

      {errorMsg && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg w-full transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={
          !form.product_title ||
          !form.price ||
          !form.owner_name ||
          form.contact_info.length !== 10 ||
          isSubmitting
        }
      >
        {isSubmitting ? "Publishing..." : "Publish Listing"}
      </button>
    </form>
  );
}