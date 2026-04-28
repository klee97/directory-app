"use server";
import { CurrentUser, getCurrentUser } from "@/lib/auth/getUser";
import { createServerClient } from "@/lib/supabase/clients/serverClient";
import { BackendUserFavoritesInsert } from "@/types/user";

type FavoriteProps = {
    vendor_id: string,
    is_favorite: boolean
};

export const upsertUserFavorite = async ({
    vendor_id,
    is_favorite
}: FavoriteProps) => {
    // Check if user is authenticated
    const currentUser: CurrentUser | null = await getCurrentUser();

    if (!currentUser) {
        console.error("Authentication error: No active session");
        throw new Error("You must be logged in to perform this action");
    }

    // Get current session to verify user is authenticated
    const supabaseServerClient = await createServerClient();


    const vendorData: BackendUserFavoritesInsert = {
        user_id: currentUser.userId,
        vendor_id,
        is_favorited: is_favorite
    }

    // Proceed with vendor creation
    const { error } = await supabaseServerClient
        .from("user_favorites")
        .upsert(vendorData, { onConflict: 'user_id, vendor_id' })
        .select();

    if (error) {
        console.error("Error creating or updating user favorite:", error);
        throw error;
    }
};
