import { createServerClient } from '@supabase/ssr';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase session on every request and enforces route-level auth protection.
 *
 * This function must be called from `src/middleware.ts` on every request. It handles two things:
 *
 * 1. SESSION REFRESH
 *    Supabase JWTs expire periodically. This function calls `supabase.auth.getUser()` on every
 *    request, which triggers a token refresh if needed and writes the updated session cookie
 *    back to the response. Server Components cannot write cookies, so this must happen here.
 *    The `supabaseResponse` object carries those updated cookies — it must be returned as-is.
 *
 * 2. ROUTE PROTECTION
 *    Redirects unauthenticated users to /login if they attempt to access any route under
 *    /partner/* (excluding /partner itself, which is public). The original destination is
 *    preserved in a `redirectTo` query param so the user can be sent there after login.
 *
 * Public routes: everything except /partner/*
 * Protected routes: /partner/* (i.e. any path starting with /partner/)
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user
    && request.nextUrl.pathname.startsWith('/partner/')
    && !request.nextUrl.pathname.startsWith('/partner/login')
  ) {
    const url = request.nextUrl.clone();
    const redirectTo = request.nextUrl.pathname + request.nextUrl.search;
    url.pathname = '/partner/login';
    url.searchParams.set('redirectTo', redirectTo);
    return NextResponse.redirect(url);
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