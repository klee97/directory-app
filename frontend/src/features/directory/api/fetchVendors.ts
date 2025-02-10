import { supabase } from '@/lib/api-client';
import { transformBackendVendorToFrontend } from '@/types/vendor';

export async function fetchAllVendors() {
  try {
    console.log("Fetching vendors");
    const { data } = await supabase
      .from('vendors_full')
      .select('*');

    if (data === null) {
      return [];
    }
    return data.map(transformBackendVendorToFrontend);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}