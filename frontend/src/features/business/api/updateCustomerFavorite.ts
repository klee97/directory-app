import { supabase } from '@/lib/api-client';

export async function updateCustomerFavorite(customer_id: string, vendor_id: string, is_favorited: boolean) {
    console.debug("Updating customer favorite with customer_id: %s, vendor_id: %s, is_favorited: %s", customer_id, vendor_id, is_favorited);
    const { error } = await supabase
        .from('user_favorites')
        .upsert({
            user_id: customer_id,
            vendor_id,
            is_favorited,
            updated_at: new Date()
        });
    if (error) {
        console.error('Error fetching customer: %s', error);
        return null;
    }
}