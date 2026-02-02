import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Setup the Response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // RULE 1: If NOT logged in, and trying to access /main -> Kick to Login
  if (!user && path.startsWith("/main")) {
    url.pathname = "/auth/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // RULE 2: If Logged in, Check ROLE in the 'users' table
  if (user && path.startsWith("/main")) {
    
    // ✅ FIX: Query the 'users' table for the 'role' column
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = userData?.role; // 'student' | 'faculty' | 'admin'
    const isFaculty = userRole === 'faculty';

    // --- SECURITY LOGIC ---

    // A. STUDENT trying to access FACULTY pages -> Kick to Student Dashboard
    if (!isFaculty && path.startsWith("/main/faculty")) {      
      url.pathname = "/main/student/dashboard";
      return NextResponse.redirect(url);
    }

    // B. FACULTY trying to access STUDENT pages -> Kick to Announcements
    if (isFaculty && path.startsWith("/main/student")) {
      url.pathname = "/main/faculty/dashboard"; // Changed to dashboard for better UX
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|auth/).*)",
  ],
};