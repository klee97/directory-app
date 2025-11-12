import { User } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null>  {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error(error);
  }
  return user;
}

