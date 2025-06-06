import { supabase } from '@/lib/api-client';
import { unstable_cache } from 'next/cache';

export async function getActiveLocations() {
  try {
    console.debug("Fetching active locations");
    const { data, error } = await supabase
      .rpc("get_active_locations");
    if (data === null) {
      return [];
    }
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

export async function getActiveLocations() {
  const result = await db.query('SELECT * FROM get_active_locations()');
  return result.rows;
}
export const getCachedVendors = unstable_cache(fetchAllVendors, ["all-vendors"], {
  revalidate: 86400,
});
