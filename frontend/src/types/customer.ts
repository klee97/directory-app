import type { Database } from "@/types/supabase";


export type BackendCustomer = Database['public']['Tables']['profiles']['Row'] & {
    favorite_vendors: BackendCustomerFavorites[]
}

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

export function transformBackendCustomerToFrontend(customer: BackendCustomer): Customer {
    return {
        id: customer.id,
        role: customer.role,
        favorite_vendors: customer.favorite_vendors
            .map((favorite) => {
                return {
                    vendor_id: favorite.vendor_id,
                    is_favorited: favorite.is_favorited ?? false
                }
            }).filter((favorite) => favorite.is_favorited)
    };
}

