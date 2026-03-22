'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type AppRole = 'student' | 'faculty' | 'admin';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // 1. Check Login Session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      // 2. Check Role from users table
      const userId = session.user.id;
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !userData) {
        await supabase.auth.signOut();
        router.push('/auth/login');
        return;
      }

      const userRole = userData.role as AppRole;
      const isFacultyLike = userRole === 'faculty' || userRole === 'admin';

      // RULE A: Student trying to enter Faculty area
      if (!isFacultyLike && pathname.startsWith('/main/faculty')) {
        router.replace('/main/student/dashboard');
        return;
      }

      // RULE B: Faculty/Admin trying to enter Student area
      if (isFacultyLike && pathname.startsWith('/main/student')) {
        router.replace('/main/faculty/dashboard');
        return;
      }

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
