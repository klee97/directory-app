import { createServerClient } from "@/lib/supabase/clients/serverClient";

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const supabaseServerClient = await createServerClient();
  const { data } = await supabaseServerClient.auth.getClaims();
  const claims = data?.claims;
  return claims ?? null;
}