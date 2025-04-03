import type { Database } from "@/types/supabase";
import { VendorId } from "./vendor";


export type BackendUser = Database['public']['Tables']['profiles']['Row']

export type BackendUserFavoritesInsert = Database['public']['Tables']['user_favorites']['Insert'];
export type BackendUserFavorites = Database['public']['Tables']['user_favorites']['Row'];

export type User = Pick<BackendUser, 'id'
    | 'role'
> & {
    'favorite_vendors': VendorId[]
}

export function transformBackendUserToFrontend(user: BackendUser, favorites: BackendUserFavorites[]): User {
    const favoriteVendorIds = favorites
        .filter((favorite) => favorite.is_favorited)
        .map((favorite) => {
            return favorite.vendor_id
        })
    return {
        id: user.id,
        role: user.role,
        favorite_vendors: favoriteVendorIds
    };
}

