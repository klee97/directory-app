'use server'

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserAction() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error(error);
    return null;
  }
  console.log("[getCurrentUserAction] Current user id fetched:", user.id);

  // Return serializable user data
  return {
    userId: user.id,
    email: user.email,
    has_password: (user.user_metadata.has_password === 'false') ? false : true,
  };
}