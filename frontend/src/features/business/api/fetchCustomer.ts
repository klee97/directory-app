import { supabase } from '@/lib/api-client';
import { transformBackendCustomerToFrontend } from '@/types/customer';

export async function fetchCustomerById(id: string) {
  console.debug("Fetching customer with ID: %s", id);

  const { data: customer, error: customerError } = await supabase
    .from('profiles')
    .select()
    .eq('id', id)
    .single();

  if (customerError) {
    console.error('Error fetching customer: %s', customerError);
    return null;
  }

  const { data: favorites, error: favoritesError } = await supabase
    .from('user_favorites')
    .select()
    .eq('user_id', id);

  if (favoritesError) {
    console.error('Error fetching favorites: %s', favoritesError);
    return null;
  }
  return transformBackendCustomerToFrontend(customer, favorites ?? []);
}