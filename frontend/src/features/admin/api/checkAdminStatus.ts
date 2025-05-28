import { SupabaseClient } from "@supabase/supabase-js";
import router from "next/router";
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
            router.push('/login?redirectTo=/admin');
            return;
        }
        // Check if user is an admin
        const { data: profileData, error: userError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

        if (userError || !profileData || !profileData.is_admin) {
            router.push('/unauthorized');
            return;
        }

        setIsAdmin(true);
    } catch (error) {
        console.error("Error checking admin status:", error);
        router.push('/login?redirectTo=/admin');
    } finally {
        setLoading(false);
    }
}