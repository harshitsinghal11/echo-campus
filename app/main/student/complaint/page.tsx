'use client';

import ComplaintForm from "@/components/complaints/complaintForm";
import ComplaintList from "@/components/complaints/ComplaintList";
import { useSessionCode } from "@/hooks/useSessionCode";
import { useUserEmail } from "@/hooks/useUserEmail";

export default function Page() {
  const sessionCode = useSessionCode();
  const userEmail = useUserEmail();
  console.log(sessionCode)

  return (
    <div className="p-4 mx-auto flex flex-col">
      <div className="flex flex-col md:flex-row gap-6 overflow-hidden">
        <ComplaintList userEmail={userEmail} />
        <ComplaintForm sessionCode={sessionCode} userEmail={userEmail} />
      </div>
    </div>
  );
}
