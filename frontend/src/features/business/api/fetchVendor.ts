import { supabase } from '@/lib/api-client';
import { transformBackendVendorToFrontend } from '@/types/vendor';

export async function fetchVendorById(id: string) {
  console.log("Fetching vendor with ID: %s", id);
  const { data: vendor, error } = await supabase
    .from('vendors')
    .select(`
      *, 
      usmetro!metro_id(display_name), 
      regions!metro_region_id(name),
      vendor_testimonials (review, author)
    `)
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching vendor: %s', error);
    return null;
  }
  return transformBackendVendorToFrontend(vendor);
}

export async function fetchVendorBySlug(slug: string) {
  console.log("Fetching vendor with slug: %s", slug);
  const { data: vendor, error } = await supabase
    .from('vendors')
    .select(`
      *, 
      usmetro!metro_id(display_name), 
      regions!metro_region_id(name),
      vendor_testimonials (review, author)
    `)
    .eq('slug', slug)
    .single();
  if (error) {
    console.error('Error fetching vendor: %s', error);
    return null;
  }
  return transformBackendVendorToFrontend(vendor);
}