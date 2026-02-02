'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // State for student details
  const [student, setStudent] = useState({
    email: '',
    sessionCode: '',
    joinedAt: '',
    role: 'Student'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. Get Auth User
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login'); // Fixed redirect path to match standard Next.js
          return;
        }

        // 2. Fetch Data (Joined Query)
        // We select session_code from 'student_profiles' AND join 'users' to get created_at
        const { data: profileData, error: dbError } = await supabase
          .from('student_profiles')
          .select(`
            session_code,
            users:user_id ( created_at, email )
          `)
          .eq('user_id', user.id)
          .single();

        if (dbError) {
          console.error("Database Error:", dbError);
        }

        // 3. Parse Data
        // The join returns 'users' as an object or array depending on the relationship
        // In a 1:1 relationship, Supabase usually returns it as a single object if configured,
        // otherwise we safe-check it.
        const userData = Array.isArray(profileData?.users) 
            ? profileData?.users[0] 
            : profileData?.users;

        setStudent({
          email: user.email || 'No Email',
          sessionCode: profileData?.session_code || 'Not Generated',
          joinedAt: userData?.created_at 
            ? new Date(userData.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) 
            : 'Unknown',
          role: 'Student'
        });

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          
          {/* Header Section */}
          <div className="bg-linear-to-r from-blue-600 to-cyan-600 px-8 py-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
               <div className="text-center md:text-left text-white">
                  <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
                  <p className="text-blue-100 mt-2">Manage your anonymous identity</p>
               </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Email */}
              <div className="group p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Mail className="w-3 h-3" /> Email Address
                 </label>
                 <p className="text-gray-900 font-semibold">{student.email}</p>
              </div>

              {/* Session Code (Anonymous ID) */}
              <div className="group p-4 rounded-xl bg-blue-50 border border-blue-100 hover:border-blue-300 transition-colors">
                 <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Shield className="w-3 h-3" /> Anonymous Username
                 </label>
                 <div className="flex items-center justify-between">
                    <p className="text-blue-900 font-mono text-lg font-bold tracking-wider">
                      {student.sessionCode}
                    </p>
                    <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                      ACTIVE
                    </span>
                 </div>
                 <p className="text-xs text-blue-400 mt-2">
                   This ID hides your real name in complaints & marketplace.
                 </p>
              </div>

              {/* Account Type */}
              <div className="group p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <User className="w-3 h-3" /> Account Type
                 </label>
                 <p className="text-gray-900 font-semibold">Verified Student</p>
              </div>

              {/* Joined Date */}
              <div className="group p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Calendar className="w-3 h-3" /> Joined Date
                 </label>
                 <p className="text-gray-900 font-semibold">{student.joinedAt}</p>
              </div>

            </div>

            {/* Back Button */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => router.push('/main/student/dashboard')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}