"use server";
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
    console.debug("Updating vendor favorite status", vendor_id, is_favorite);

    // Get current session to verify user is authenticated
    const supabaseServerClient = await createServerClient();

    console.debug("Authenticating...");

    // Check if user is authenticated
    const { data, error: sessionError } = await supabaseServerClient.auth.getClaims();
    const user = data?.claims;

    if (!user || sessionError) {
        console.error("Authentication error:", sessionError || "No active session");
        throw new Error("You must be logged in to perform this action");
    }

    const vendorData: BackendUserFavoritesInsert = {
        user_id: user.sub,
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
