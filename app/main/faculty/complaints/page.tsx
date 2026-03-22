import { MessageSquare } from "lucide-react";
import ComplaintList from "@/components/complaints/ComplaintList";

export default function FacultyComplaintsPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-blue-600" />
          Student Complaints
        </h1>
        <p className="text-gray-500 mt-2">
          Review concerns submitted by students and monitor community trends.
        </p>
      </header>

      <ComplaintList />
    </div>
  );
}
