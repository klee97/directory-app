import { supabase } from '@/lib/api-client';
import { shouldIncludeTestVendors } from '@/lib/env/env';
import { transformBackendVendorToFrontend } from '@/types/vendor';
import { unstable_cache } from 'next/cache';

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
      vendor_media (id, media_url, is_featured, consent_given, credits)
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

// Cached version for individual vendor
export const getCachedVendor = (slug: string) =>
  unstable_cache(
    () => fetchVendorBySlug(slug),
    [`vendor-${slug}`],
    {
      revalidate: 86400, // 24 hours
      tags: [`vendor-${slug}`, 'all-vendors']
    }
  )();

export async function fetchAllVendors() {
  try {
    console.debug("Fetching vendors");

    let query = supabase.from('vendors')
      .select(`
        *, 
        usmetro!metro_id(display_name), 
        regions!metro_region_id(name),
        tags (id, display_name, name, type, is_visible, style),
        vendor_media (id, media_url, is_featured, consent_given, credits)
      `)
      .eq('include_in_directory', true)
      ;

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
  {
    revalidate: 86400, // 24 hours
    tags: ["all-vendors"]
  }
);