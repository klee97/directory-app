import { supabase } from '@/lib/api-client';
import { transformBackendCustomerToFrontend } from '@/types/customer';

export async function fetchCustomerById(id: string) {
  console.debug("Fetching customer with ID: %s", id);
  const { data: customer, error } = await supabase
    .from('profiles')
    .select(`
      *, 
      user_favorites (user_id, vendor_id, is_favorited)
    `)
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching customer: %s', error);
    return null;
  }
  return transformBackendCustomerToFrontend(customer);
}