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
    id: user.id,
  };
}