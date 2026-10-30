import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/partner/dashboard', '/partner/settings', '/admin', '/favorites', '/settings'];
const PARTNER_LOGIN_PATH = '/partner/login';

/**
 * Refreshes the Supabase session on every request and enforces route-level auth protection. It handles two things:
 *
 * 1. Session Refresh
 *    Supabase JWTs expire periodically. This function calls `supabase.auth.getClaims()` on every
 *    request, which verifies and refreshes the token locally using the project's public asymmetric
 *    key — no network round-trip to the Supabase auth server required. The updated session cookie
 *    is written back to the response. Server Components cannot write cookies, so this must happen here.
 *    The `supabaseResponse` object carries those updated cookies — it must be returned as-is.
 *
 * 2. Route Protection
 *    Redirects unauthenticated users to /login if they attempt to access any route under
 *    /partner/* (excluding /partner itself, which is public). The original destination is
 *    preserved in a `redirectTo` query param so the user can be sent there after login.
 *
 * Public routes: everything except /partner/*
 * Protected routes: /partner/*
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  let authHeaders: Record<string, string> = {};            // 1. add this

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          authHeaders = { ...headers };
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims;


  const redirectWithSessionCookies = (url: URL) => {
    const response = NextResponse.redirect(url);

    for (const cookie of supabaseResponse.cookies.getAll()) {
      response.cookies.set(cookie);
    }

    for (const [key, value] of Object.entries(authHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  };

  /** Matches the path itself or anything beneath it, but not look-alikes like /settings-public. */
  const isProtectedPath = (pathname: string) =>
    PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const { pathname, search } = request.nextUrl;

  // Redirect unauthenticated users away from protected paths
  if (!isLoggedIn && isProtectedPath(pathname) && pathname !== PARTNER_LOGIN_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith('/partner/') ? PARTNER_LOGIN_PATH : '/login';
    url.searchParams.set('redirectTo', pathname + search);
    return redirectWithSessionCookies(url);
  }

  // Redirect authenticated users away from login pages
  if (isLoggedIn) {
    if (pathname === PARTNER_LOGIN_PATH) {
      const url = request.nextUrl.clone();
      url.pathname = '/partner/dashboard';
      url.searchParams.delete('redirectTo');
      return redirectWithSessionCookies(url);
    }
    if (pathname === '/login' || pathname === '/signup') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.delete('redirectTo');
      return redirectWithSessionCookies(url);
    }
  }
  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}