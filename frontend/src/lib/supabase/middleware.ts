import { isPostInFuture } from '@/features/blog/api/getBlogPosts';
import { createServerClient } from '@supabase/ssr';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/partner/dashboard', '/partner/settings', '/admin/', '/favorites', '/settings'];

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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: ResponseCookie }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
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

  // Redirect unauthenticated users away from protected paths
  if (!isLoggedIn
    && PROTECTED_PATHS.some(path => request.nextUrl.pathname.startsWith(path))
    && !request.nextUrl.pathname.startsWith('/partner/login')
  ) {
    const url = request.nextUrl.clone();
    const redirectTo = request.nextUrl.pathname + request.nextUrl.search;
    url.pathname = request.nextUrl.pathname.startsWith('/partner/') ? '/partner/login' : '/login';
    url.searchParams.set('redirectTo', redirectTo);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login pages
  if (isLoggedIn) {
    if (request.nextUrl.pathname === '/partner/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/partner/dashboard';
      url.searchParams.delete('redirectTo');
      return NextResponse.redirect(url);
    }
    if (request.nextUrl.pathname === '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.delete('redirectTo');
      return NextResponse.redirect(url);
    }
  }

  if (request.nextUrl.pathname.startsWith('/blog/')) {
    const slug = request.nextUrl.pathname.split('/blog/')[1]

    if (slug) {
      const isFuture = await isPostInFuture(slug)

      if (isFuture) {
        const previewCookie = request.cookies.get('preview-auth')
        const authorized = previewCookie?.value === process.env.BLOG_PREVIEW_PASSWORD

        if (!authorized) {
          const url = request.nextUrl.clone()
          url.pathname = '/preview-login'
          url.searchParams.set('redirectTo', request.nextUrl.pathname)
          return NextResponse.redirect(url)
        }
      }
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