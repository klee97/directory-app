import { supabase } from '@/lib/api-client';
import { transformBackendVendorToFrontend } from '@/types/vendor';
import { unstable_cache } from 'next/cache';

export async function fetchAllVendors() {
  try {
    console.debug("Fetching vendors");
    const { data } = await supabase.from('vendors')
      .select(`
      *, 
      usmetro!metro_id(display_name), 
      regions!metro_region_id(name),
      tags (id, display_name, is_visible, style)
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

export const getCachedVendors = unstable_cache(fetchAllVendors, ["all-vendors"], {
  revalidate: 86400,
});
