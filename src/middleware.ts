import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createClient(request);

  // Refresh session cookie if it's expired.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Guard admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
    const isLoginPage = pathname === '/admin';

    // Super Admin route check
    if (pathname === '/admin/super') {
      const url = request.nextUrl.clone();
      url.pathname = '/super-admin';
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/super-admin')) {
      if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin'; // Redirect to login
        return NextResponse.redirect(url);
      }
    }

    // Single-user app: never redirect admin routes to home.
    // Require login only for non-login admin pages.
    if (!session && !isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    // If already logged in and visiting /admin (login page), send to dashboard.
    // This keeps the login experience simple while honoring the user's request
    // to avoid redirecting admin routes to the public home page.
    if (session && isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
