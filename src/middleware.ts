import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Setup the Response (Standard Next.js + Supabase setup)
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

  // 2. Check Auth: Is the user logged in?
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

  // RULE 2: If Logged in, Check ROLE and enforce Folder Access
  if (user && path.startsWith("/main")) {
    
    // Check if this user is a Faculty member
    // We check the 'faculty_users' table. If they are there, they are Faculty.
    const { data: facultyProfile } = await supabase
      .from("faculty_users")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const isFaculty = !!facultyProfile; // true if faculty, false if student

    // --- SECURITY LOGIC ---

    // A. STUDENT trying to access ADMIN pages -> Kick to Student Dashboard
    if (!isFaculty && path.startsWith("/main/admin")) {      
      url.pathname = "/main/student/dashboard";
      return NextResponse.redirect(url);
    }

    // B. FACULTY trying to access STUDENT pages -> Kick to Announcements
    if (isFaculty && path.startsWith("/main/student")) {
      url.pathname = "/main/admin/announcements";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     * - auth/ (Login pages)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|auth/).*)",
  ],
};