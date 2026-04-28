'use server';

import { getCachedVendors } from '@/lib/vendor/fetchVendors';
import { createServerClient } from '@/lib/supabase/clients/serverClient';
import { Vendor, VendorId } from "@/types/vendor";

export async function getFavoriteVendorIds(): Promise<VendorId[]> {
  const supabaseServerClient = await createServerClient();
  const { data } = await supabaseServerClient.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return [];
  }

  const { data: favorites } = await supabaseServerClient
    .from('user_favorites')
    .select('vendor_id')
    .eq('user_id', user.sub)
    .eq('is_favorited', true);

  return favorites?.map(f => f.vendor_id) ?? [];
}

export async function getFavoriteVendors(): Promise<Vendor[]> {
  const favoriteVendorIds = await getFavoriteVendorIds()
  if (favoriteVendorIds.length === 0) {
    console.debug("No favorite vendors found for user");
    return [];
  }
  const favoriteVendorIdsSet = new Set(favoriteVendorIds);
  const vendors = await getCachedVendors();
  return vendors
    .filter((vendor) => favoriteVendorIdsSet.has(vendor.id))
    .sort((a, b) => {
      // Sort by the order of appearance in the favoriteVendorIds set
      const vendorA = a.business_name ?? "";
      const vendorB = b.business_name ?? "";
      return vendorA.localeCompare(vendorB) // Fallback to alphabetical order if needed
    })
    .map(vendor => ({
      ...vendor
    }));
}
