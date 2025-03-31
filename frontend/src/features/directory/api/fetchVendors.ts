import { supabase } from '@/lib/api-client';
import { transformBackendVendorToFrontend } from '@/types/vendor';

export async function fetchAllVendors() {
  try {
    console.debug("Fetching vendors");
    const { data } = await supabase.from('vendors')
    .select(`
      *, 
      usmetro!metro_id(display_name), 
      regions!metro_region_id(name)
    `);
    if (data === null) {
      return [];
    }
    return data.map(transformBackendVendorToFrontend);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}