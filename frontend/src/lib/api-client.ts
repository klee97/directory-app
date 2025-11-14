import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for browser-only usage.
 * 
 * This instance does not include SSR or cookie-based session handling,
 * and should be used only in pure client-side contexts.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)