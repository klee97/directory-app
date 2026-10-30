import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import 'server-only';

type Options = {
  /** Receives the cache headers @supabase/ssr wants applied to the response. */
  onHeaders?: (headers: Record<string, string>) => void;
};

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
 * @returns {Promise<ReturnType<typeof createSupabaseServerClient>>} A configured Supabase server client.
 */
export async function createServerClient(options: Options = {}) {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component: safe to ignore if middleware refreshes sessions.
          }
          if (headers) options.onHeaders?.(headers);
        },
      },
    },
  );
}