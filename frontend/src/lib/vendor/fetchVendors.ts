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

export async function fetchVendorById(id: string) {
  console.debug("Fetching vendor with id: %s", id);

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
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching vendor: %s', error);
    return null;
  }
  return transformBackendVendorToFrontend(vendor);
}

export async function getVendorByIdOrSlug({ id, slug }: { id?: string, slug?: string }) {
  if (id) {
    return fetchVendorById(id);
  } else if (slug) {
    return fetchVendorBySlug(slug);
  }
  return null;
}

const _getCachedVendor = (slug: string) => unstable_cache(
  async () => {
    console.debug('[Cache] Requested vendor slug:', slug);
    const v = await fetchVendorBySlug(slug);
    if (!v) throw new Error(`Vendor not found for slug: ${slug}`);
    return v;
  },
  [`vendor-${slug}`],
  { revalidate: 86400, tags: [`vendor-${slug}`, 'all-vendors'] }
)();

// Cached version for individual vendor
export async function getCachedVendor(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  try {
    return await _getCachedVendor(normalizedSlug);
  } catch (err) {
    console.error('[Cache] Failed to fetch vendor:', err);
    return null;
  }
}

export async function fetchAllVendors() {
  try {
    console.debug("Fetching all vendors");

    let query = supabase.from('vendors')
      .select(`
        *, 
        usmetro!metro_id(display_name), 
        regions!metro_region_id(name),
        tags (id, display_name, name, type, is_visible, style),
        vendor_media (id, media_url, is_featured, consent_given, credits)
      `)
      .eq('include_in_directory', true);

    if (!shouldIncludeTestVendors()) {
      query = query.not('id', 'like', 'TEST-%');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch vendors from DB'); // prevents caching null
    }

    if (!data || data.length === 0) {
      console.warn('[fetchAllVendors] No vendors returned');
      return []; // safe to cache empty array if intentional
    }

    return data.map(transformBackendVendorToFrontend);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch vendors.'); // prevents caching null
  }
}


const _getCachedVendors = unstable_cache(
  fetchAllVendors,
  ["all-vendors", shouldIncludeTestVendors() ? "with-test" : "production-only"],
  { revalidate: 86400, tags: ['all-vendors'] }
);

export async function getCachedVendors() {
  try {
    return await _getCachedVendors();
  } catch (err) {
    console.error('[Cache] Failed to fetch vendors:', err);
    return [];
  }
}