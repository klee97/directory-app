import { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

export const checkAdminStatus = async (
  supabase: SupabaseClient,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setIsAdmin: Dispatch<SetStateAction<boolean>>
) => {
  try {
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      redirect('/login?redirectTo=/admin');
    }
    // Check if user is an admin
    const { data: profileData, error: userError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (userError || !profileData || !profileData.is_admin) {
      redirect('/unauthorized');
    }

    setIsAdmin(true);
  } catch (error) {
    console.error("Error checking admin status:", error);
    redirect('/login?redirectTo=/admin');
  } finally {
    setLoading(false);
  }
}