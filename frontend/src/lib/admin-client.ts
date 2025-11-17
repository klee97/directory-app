import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Supabase admin client using the service role key.
 *
 * This client bypasses Row Level Security (RLS) and should only be used
 * in secure server-side contexts (e.g., API routes, server actions, or
 * background jobs). Never expose this key or client to the browser.
 */
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
