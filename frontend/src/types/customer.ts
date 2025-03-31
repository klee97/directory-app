import type { Database } from "@/types/supabase";
import { VendorId } from "./vendor";


export type BackendCustomer = Database['public']['Tables']['profiles']['Row']

export type BackendCustomerFavoritesInsert = Database['public']['Tables']['user_favorites']['Insert'];
export type BackendCustomerFavorites = Database['public']['Tables']['user_favorites']['Row'];

export type Customer = Pick<BackendCustomer, 'id'
    | 'role'
> & {
    'favorite_vendors': VendorId[]
}

export function transformBackendCustomerToFrontend(customer: BackendCustomer, favorites: BackendCustomerFavorites[]): Customer {
    const favoriteVendorIds = favorites
        .filter((favorite) => favorite.is_favorited)
        .map((favorite) => {
            return favorite.vendor_id
        })
    return {
        id: customer.id,
        role: customer.role,
        favorite_vendors: favoriteVendorIds
    };
}

