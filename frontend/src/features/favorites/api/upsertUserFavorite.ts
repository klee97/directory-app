"use server";
import { createClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();

    console.debug("Authenticating...");

    // Check if user is authenticated
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to perform this action" };
    }

    if (sessionError) {
        console.error("Authentication error:", sessionError || "No active session");
        throw new Error("You must be logged in to perform this action");
    }

    const vendorData: BackendUserFavoritesInsert = {
        user_id: user.id,
        vendor_id,
        is_favorited: is_favorite
    }

    // Proceed with vendor creation
    const { data, error } = await supabase
        .from("user_favorites")
        .upsert(vendorData, { onConflict: 'user_id, vendor_id' })
        .select();

    if (error) {
        console.error("Error creating or updating user favorite:", error);
        throw error;
    }

    console.debug("Vendor favorited or unfavorited successfully!", data);

    return data;
};
