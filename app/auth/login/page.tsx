"use client";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { generateUniqueCode } from '@/utils/generateUniqueCode';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // --- HELPER: Handle Student Session Code ---
  async function handleStudentSession(userId: string) {
    // 1. Check if profile exists
    const { data: profile, error } = await supabase
      .from("student_profiles")
      .select("session_code")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore "not found" error for now
      console.error("Profile Fetch Error:", error);
      return null;
    }

    // 2. If code exists, return it
    if (profile?.session_code) {
      return profile.session_code;
    }

    // 3. If no code (First time student), generate and save it
    const newCode = generateUniqueCode(7);

    // We use upsert to create the profile if it doesn't exist yet
    const { error: updateError } = await supabase
      .from("student_profiles")
      .upsert({ user_id: userId, session_code: newCode });

    if (updateError) throw updateError;

    return newCode;
  }

  // --- MAIN LOGIN FUNCTION ---
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Perform Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        alert(authError?.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // 2. Fetch User Role from 'users' table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (userError || !userData) {
        alert("User profile not found. Please contact support.");
        setIsLoading(false);
        return;
      }

      const role = userData.role; // 'student' | 'faculty' | 'admin'
      console.log(`✅ Logged in as: ${role.toUpperCase()}`);

      // 3. Routing Logic
      if (role === 'faculty') {
        sessionStorage.setItem("userRole", "faculty");
        router.push("/main/faculty/dashboard/");
      }
      else if (role === 'student') {
        // Generate/Get Session Code
        const sessionCode = await handleStudentSession(authData.user.id);

        sessionStorage.setItem("userSessionCode", sessionCode || "");
        sessionStorage.setItem("userRole", "student");
        router.push("/main/student/dashboard/");
      }
      else {
        alert("Unknown role");
      }

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      console.error("Critical Login Error:", error);
      alert(message);
    }
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4'>
      {/* ... Your existing JSX UI code ... */}
      <div className='relative w-full max-w-md'>
        <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight'>
              Echo<span className='text-blue-600'>Campus</span>
            </h1>
            <p className='text-lg text-gray-600 font-medium tracking-wide'>
              Meet. Learn. Build.
            </p>
          </div>

          <form onSubmit={onSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <label htmlFor='email' className='block text-sm font-semibold text-gray-700'>
                Email Address
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='email'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className='w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100'
                  placeholder='Enter your email'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label htmlFor='password' className='block text-sm font-semibold text-gray-700'>
                Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className='w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100'
                  placeholder='Enter your password'
                />
                <button
                  type='button'
                  onClick={togglePasswordVisibility}
                  className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group'
            >
              <span className='flex items-center justify-center'>
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Login Now
                    <ArrowRight className='ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200' />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}