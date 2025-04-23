import { createClient } from '@/lib/supabase/client';

export async function fetchVendorBySlug(slug: string) {
  console.debug("Fetching vendor with slug: %s", slug);
  const supabase = createClient();
  const { data: vendor, error } = await supabase
    .from('vendors')
    .select(`
      id 
    `)
    .eq('slug', slug)
    .single();
  if (error) {
    console.error('Error fetching vendor: %s', error);
    return null;
  }
  return vendor?.id;
}