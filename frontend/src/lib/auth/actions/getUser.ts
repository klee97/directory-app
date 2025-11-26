'use server'

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserAction() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error(error);
    return null;
  }

  // Return serializable user data
  return {
    userId: user.id,
    accessToken: user.user_metadata.access_token,
    email: user.email,
    has_password: (user.user_metadata.has_password === 'false') ? false : true,
  };
}