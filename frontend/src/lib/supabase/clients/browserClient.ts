import { createBrowserClient as createSupabaseBrowserClient} from '@supabase/ssr';

/**
 * Client when running in the browser (client components or browser-only scripts)
 * that allows Supabase auth to persist via cookies.
 * It automatically syncs Supabase’s session with your cookies, so login/logout
 * persists seamlessly across page reloads and server requests.
 * Internally deduplicates instances, so calling createClient() multiple times
 * is safe.
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

