import { supabase } from '@/lib/api-client';
import { shouldIncludeTestVendors } from '@/lib/env/env';
import { transformBackendVendorToFrontend } from '@/types/vendor';
import { unstable_cache } from 'next/cache';

export async function fetchAllVendors() {
  try {
    console.debug("Fetching vendors");

    let query = supabase.from('vendors')
      .select(`
        *, 
        usmetro!metro_id(display_name), 
        regions!metro_region_id(name),
        tags (id, display_name, name, type, is_visible, style),
        vendor_media (id, media_url)
      `);

    if (!shouldIncludeTestVendors()) {
      query = query.not('id', 'like', 'TEST-%');
    }

    const { data } = await query;

    if (data === null) {
      return [];
    }
    return data.map(transformBackendVendorToFrontend);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

export const getCachedVendors = unstable_cache(
  fetchAllVendors,
  ["all-vendors", shouldIncludeTestVendors() ? "with-test" : "production-only"],
  { revalidate: 86400 }
);