"use client";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { generateUniqueCode } from '@/utils/generateUniqueCode';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Fixed: was missing set function
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // 1. Basic Login Helper
  async function performLogin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) {
      return { success: false, message: error?.message || "Login failed" };
    }
    return { success: true, user: data.user };
  }

  // 2. Student Session Helper (Only runs for students)
  async function getOrCreateSessionCode(user: { id: string; email?: string }) {
    // Check if user exists in 'student_users' table
    const { data } = await supabase
      .from("student_users")
      .select("session_code")
      .eq("id", user.id)
      .maybeSingle();

    // If not found, CREATE them (First time login)
    if (!data) {
      const newCode = generateUniqueCode(7);
      const { error } = await supabase.from("student_users").insert({
        id: user.id,
        email: user.email,
        session_code: newCode,
      });
      if (error) throw error;
      return newCode;
    }

    // If found but code is missing
    if (!data.session_code) {
      const newCode = generateUniqueCode(7);
      await supabase.from("student_users").update({ session_code: newCode }).eq("id", user.id);
      return newCode;
    }

    return data.session_code;
  }

  // 3. MAIN SUBMIT HANDLER
  const onSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // A. Perform Auth
      const res = await performLogin(email, password);

      if (!res.success || !res.user) {
        alert(res.message);
        setIsLoading(false);
        return;
      }

      console.log("Auth Successful. User ID:", res.user.id);

      // B. CHECK ROLE: Is this user in the Faculty Table?
      const { data: facultyData } = await supabase
        .from("faculty_users")
        .select("id") // We just need to know if a row exists
        .eq("user_id", res.user.id)
        .maybeSingle();

      if (facultyData) {
        // --- FACULTY PATH ---
        console.log("✅ LOGGED IN AS: FACULTY");
        console.log("Redirecting to Faculty Dashboard...");

        // Save a flag for the session
        sessionStorage.setItem("userRole", "faculty");

        // Redirect (You can change this path later)
        router.push("/main/admin/dashboard/");
      } else {
        // --- STUDENT PATH ---
        console.log("✅ LOGGED IN AS: STUDENT");
        console.log("Generating Session Code...");

        // Only run this for students!
        const sessionCode = await getOrCreateSessionCode(res.user);

        sessionStorage.setItem("userSessionCode", sessionCode);
        sessionStorage.setItem("userRole", "student");
        router.push("/main/student/dashboard/");
      }

    } catch (error: any) {
      console.error("Login Critical Error:", error);
      alert("Something went wrong during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4'>
      {/* Background decorative elements omitted for brevity - keep your existing ones */}
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