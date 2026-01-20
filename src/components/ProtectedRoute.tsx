'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Get current URL
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // 1. Check Login Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("🔒 No session, redirecting to login");
        router.push('/auth/login');
        return;
      }

      // 2. Check Role (Faculty vs Student)
      const userId = session.user.id;
      
      // Query the faculty table to see if this user is a teacher
      const { data: facultyProfile } = await supabase
        .from("faculty_users")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      const isFaculty = !!facultyProfile; // true if found, false if not

      // 3. ENFORCE RULES based on the current Path
      
      // RULE A: Student trying to enter Admin Area?
      if (!isFaculty && pathname.startsWith('/main/admin')) {
        console.log("⛔ Student blocked from Admin Page");
        router.replace('/main/student/dashboard'); // Use replace to prevent "Back" button loops
        return;
      }

      // RULE B: Faculty trying to enter Student Area?
      if (isFaculty && pathname.startsWith('/main/student')) {
        console.log("⛔ Faculty blocked from Student Page");
        router.replace('/main/admin/dashboard');
        return;
      }

      // 4. Access Granted
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAccess();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Verifying Access...</p>
      </div>
    );
  }

  // Only render children if explicit permission is granted
  return isAuthorized ? <>{children}</> : null;
}