import { supabase } from '@/lib/api-client';
import { shouldIncludeTestVendors } from '@/lib/env/env';
import { transformBackendVendorToFrontend } from '@/types/vendor';

export async function fetchVendorById(id: string) {
  console.debug("Fetching vendor with ID: %s", id);
  let query = supabase
    .from('vendors')
    .select(`
      *, 
      usmetro!metro_id(display_name), 
      regions!metro_region_id(name),
      vendor_testimonials (review, author),
      tags (id, display_name, name, type, is_visible, style),
      vendor_media (id, media_url)
    `);

  if (!shouldIncludeTestVendors()) {
    query = query.not('id', 'like', 'TEST-%');
  }
  const { data: vendor, error } = await query
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching vendor: %s', error);
    return null;
  }
  return transformBackendVendorToFrontend(vendor);
}

export async function fetchVendorBySlug(slug: string) {
  console.debug("Fetching vendor with slug: %s", slug);

  let query = supabase
    .from('vendors')
    .select(`
      *, 
      usmetro!metro_id(display_name), 
      regions!metro_region_id(name),
      vendor_testimonials (review, author),
      tags (id, display_name, name, type, is_visible, style),
      vendor_media (id, media_url)
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
  return transformBackendVendorToFrontend(vendor);
}