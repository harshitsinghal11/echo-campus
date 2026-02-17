import { useState } from "react";
import { AlertCircle, CheckCircle2, MessageSquare, Send } from "lucide-react";

interface ComplaintFormProps {
  sessionCode: string | null;
  userEmail: string;
}
export default function ComplaintForm({ sessionCode, userEmail }: ComplaintFormProps) {
  const [complaint, setComplaint] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitComplaint() {
    if (!complaint.trim()) {
      setMsg("Please enter your complaint before submitting");
      setMsgType("error");
      return;
    }

    if (!userEmail) {
      setMsg("Missing user email");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMsg("");
    setMsgType("");

    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionCode, complaint, email: userEmail }),
    });

    const data = await res.json();
    console.log("API response:", data);

    if (data.error) {
      setMsg(data.error);
      setMsgType("error");
    } else {
      setMsg("Thank you! Your complaint has been submitted successfully.");
      setMsgType("success");
      setComplaint("");
    }
    setLoading(false);
  }

  const charCount = complaint.length;
  const maxChars = 500;

  return (
    <div className=" bg-gray-50 rounded-xl p-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-xl">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-white" />
          <h2 className="text-xl font-semibold text-white">Submit a Complaint</h2>
        </div>
        <p className="text-blue-100 text-sm mt-1">
          We value your feedback and will review your complaint promptly
        </p>
      </div>
      {/* Current Session name */}
      <div>
        <p className="text-sm font-bold px-2 py-4 text-gray-900">
          {sessionCode}
        </p>  
      </div>
      {/* Form Body */}
      <div className="space-y-4">
        {/* Textarea */}
        <div>
          <textarea
            id="complaint"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Please provide detailed information about your complaint..."
            maxLength={maxChars}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-400"
            rows={6}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              Be as specific as possible to help us address your concern
            </span>
            <span className={`text-xs font-medium ${charCount > maxChars * 0.9 ? 'text-orange-600' : 'text-gray-500'}`}>
              {charCount} / {maxChars}
            </span>
          </div>
        </div>

        {/* Message Display */}
        {msg && (
          <div
            className={`flex items-start gap-3 p-4 rounded-lg ${msgType === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
              }`}
          >
            {msgType === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${msgType === "success" ? "text-green-800" : "text-red-800"}`}>
              {msg}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={submitComplaint}
          disabled={loading || !complaint.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}