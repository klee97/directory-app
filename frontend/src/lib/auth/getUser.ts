import { createServerClient } from "@/lib/supabase/clients/serverClient";
import { cache } from "react";

export type CurrentUser = {
  email: string;
  userId: string;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabaseServerClient = await createServerClient();
  const { data, error } = await supabaseServerClient.auth.getClaims();

  if (error) {
    console.error('getCurrentUser failed:', error);
    return null;
  }

  const claims = data?.claims;
  if (!claims) return null;

  return {
    email: claims.email,
    userId: claims.sub,
  } as CurrentUser;
});

