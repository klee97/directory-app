"use server";
import { createServerClient } from '@supabase/ssr';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client configured for server-side use with Next.js App Router.
 *
 * This helper wraps `createServerClient` from `@supabase/ssr` and connects it to
 * Next.js's `cookies()` API, allowing Supabase to read and write authentication
 * cookies during server-side rendering or API route execution.
 *
 * The `cookies` interface passed here:
 * - `getAll()` retrieves all cookies from the current request (for reading auth state).
 * - `setAll()` attempts to update cookies (for refreshing sessions).
 *
 * The `setAll()` method may safely fail in Server Components, since they can’t modify
 * response headers; Supabase session refresh should instead occur in middleware or
 * route handlers that run on the server.
 *
 * @returns {Promise<ReturnType<typeof createServerClient>>} A configured Supabase server client.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: ResponseCookie }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}