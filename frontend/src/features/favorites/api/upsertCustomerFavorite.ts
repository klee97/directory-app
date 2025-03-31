"use server";
import { createClient } from "@/lib/supabase/server";
import { BackendCustomerFavoritesInsert } from "@/types/customer";

type FavoriteProps = {
    vendor_id: string,
    is_favorited: boolean
};

export const upsertCustomerFavorite = async ({
    vendor_id,
    is_favorited
}: FavoriteProps) => {
    console.debug("Updating vendor favorite status", vendor_id, is_favorited);

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

    const vendorData: BackendCustomerFavoritesInsert = {
        user_id: user.id,
        vendor_id,
        is_favorited
    }

    // Proceed with vendor creation
    const { data, error } = await supabase
        .from("user_favorites")
        .upsert(vendorData, { onConflict: 'user_id, vendor_id' })
        .select();

    if (error) {
        console.error("Error creating or updating customer favorite:", error);
        throw error;
    }

    console.debug("Vendor favorited or unfavorited successfully!", data);

    return data;
};
