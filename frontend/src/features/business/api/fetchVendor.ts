import { supabase } from '@/lib/api-client';

export async function fetchVendorById(id: string) {
  console.log("Fetching vendor with ID: %s", id);
  const { data: vendor, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching vendor: %s', error);
    return null;
  }
  return vendor;
}

export async function fetchVendorBySlug(slug: string) {
  console.log("Fetching vendor with slug: %s", slug);
  const { data: vendor, error } = await supabase
    .from('vendors_test')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) {
    console.error('Error fetching vendor: %s', error);
    return null;
  }
  return vendor;
}