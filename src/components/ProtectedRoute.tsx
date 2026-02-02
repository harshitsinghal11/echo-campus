'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

      // 2. Check Role (Updated for Single Table Architecture)
      const userId = session.user.id;
      
      // Query the 'users' table for the 'role' column
      const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (error || !userData) {
        console.error("Error fetching user role:", error);
        // Safety Fallback: Force logout if role is missing/corrupted
        await supabase.auth.signOut();
        router.push('/auth/login');
        return;
      }

      const userRole = userData.role; // 'faculty' or 'student'
      const isFaculty = userRole === 'faculty';

      // 3. ENFORCE RULES based on the current Path
      
      // RULE A: Student trying to enter Faculty/Admin Area?
      if (!isFaculty && (pathname.startsWith('/main/admin') || pathname.startsWith('/main/faculty'))) {
        console.log("⛔ Student blocked from Faculty Page");
        router.replace('/main/student/dashboard');
        return;
      }

      // RULE B: Faculty trying to enter Student Area?
      if (isFaculty && pathname.startsWith('/main/student')) {
        console.log("⛔ Faculty blocked from Student Page");
        router.replace('/main/faculty/dashboard'); // Note: Changed to /faculty/dashboard to match your structure
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

  return isAuthorized ? <>{children}</> : null;
}