import { createBrowserClient } from '@supabase/ssr';

/**
 * Client when running in the browser (client components or browser-only scripts)
 * that allows Supabase auth to persist via cookies.
 * It automatically syncs Supabase’s session with your cookies, so login/logout
 * persists seamlessly across page reloads and server requests.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

