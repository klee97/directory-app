import { shouldIncludeTestVendors } from '@/lib/env/env';
import { createClient } from '@/lib/supabase/client';

export async function fetchVendorBySlug(slug: string) {
  console.debug("Fetching vendor with slug: %s", slug);
  const supabase = createClient();
  let query = supabase
    .from('vendors')
    .select(`
      id 
    `);

  if (!shouldIncludeTestVendors()) {
    query = query.not('id', 'like', 'TEST-%');
  }
  const { data: vendor, error } = await query
    .eq('slug', slug)
    .single();
  if (error) {
    console.error('Error fetching vendor: %s', error);
    return null;
  }
  return vendor?.id;
}