import type { Database } from "@/types/supabase";


export type BackendCustomer = Database['public']['Tables']['profiles']['Row']

export type BackendCustomerFavoritesInsert = Database['public']['Tables']['user_favorites']['Insert'];
export type BackendCustomerFavorites = Database['public']['Tables']['user_favorites']['Row'];

export type CustomerFavorite = Pick<BackendCustomerFavorites,
    | 'vendor_id'
    | 'is_favorited'
>;

export type Customer = Pick<BackendCustomer, 'id'
    | 'role'
> & {
    'favorite_vendors': CustomerFavorite[]
}

export function transformBackendCustomerToFrontend(customer: BackendCustomer, favorites: BackendCustomerFavorites[]): Customer {
    return {
        id: customer.id,
        role: customer.role,
        favorite_vendors: favorites
            .map((favorite) => {
                return {
                    vendor_id: favorite.vendor_id,
                    is_favorited: favorite.is_favorited ?? false
                }
            }).filter((favorite) => favorite.is_favorited)
    };
}

