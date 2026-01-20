"use client";

import { useState } from "react";
import { useUserEmail } from "@/hooks/useUserEmail";

export default function MarketCreateForm() {
  const userEmail = useUserEmail();
  const [ownerName, setOwnerName] = useState("");
  
  // 1. New State for Error Message
  const [errorMsg, setErrorMsg] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    product_title: "",
    description: "",
    price: "",
    contact_info: "",
  });

  async function submit() {
    // Reset previous errors
    setErrorMsg("");

    if (!ownerName) return setErrorMsg("Owner Name is required");
    if (!userEmail) return setErrorMsg("Email not loaded. Please wait or refresh.");
    if (form.contact_info.length !== 10) return setErrorMsg("Contact info must be exactly 10 digits");

    setIsSubmitting(true);

    try {
      console.log("Submitting form..."); // Debug Log

      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          owner_name: ownerName,
          owner_email: userEmail,
        }),
      });

      // 2. Read the response body
      const data = await res.json();
      console.log("Server Response:", data); // Debug Log: Check this in Console (F12)

      // 3. Handle Errors (If status is NOT 200-299)
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to publish item.");
        setIsSubmitting(false);
        return; // Stop here
      }

      // 4. Success Case
      alert("Item Published Successfully!");
      
      // Clear form
      setForm({
        product_title: "",
        description: "",
        price: "",
        contact_info: "",
      });
      setOwnerName("");
      
      // Refresh page to show listing
      window.location.reload(); 

    } catch (error) {
      console.error("Network/Parsing Error:", error);
      setErrorMsg("Connection failed. Please check your internet.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 text-black rounded-lg shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Trade Something?</h2>

      <input
        placeholder="Title"
        value={form.product_title}
        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        onChange={(e) => setForm({ ...form, product_title: e.target.value })}
      />

      <textarea
        placeholder="Description (short & clear)"
        value={form.description}
        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
        rows={3}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <div className="space-y-1">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Price (₹)"
          value={form.price}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/\D/g, "");
            if (digitsOnly.length <= 6) {
              setForm({ ...form, price: digitsOnly });
            }
          }}
        />
      </div>

      <input
        placeholder="Your Full Name"
        value={ownerName}
        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        onChange={(e) => setOwnerName(e.target.value)}
      />

      <input
        className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50 text-gray-500 cursor-not-allowed"
        value={userEmail || "Loading email..."}
        readOnly
      />

      <div className="space-y-1">
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
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {errorMsg && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <button
        className={`bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg w-full transition shadow-sm 
          ${isSubmitting ? "opacity-50 cursor-wait" : "hover:shadow-md"}
          disabled:bg-gray-400 disabled:cursor-not-allowed`}
        onClick={submit}
        disabled={
          !form.product_title ||
          !form.price ||
          !ownerName ||
          !form.contact_info || 
          form.contact_info.length !== 10 ||
          isSubmitting
        }
      >
        {isSubmitting ? "Publishing..." : "Publish Listing"}
      </button>
    </div>
  );
}