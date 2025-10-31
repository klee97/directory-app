import { fetchAllVendors } from '@/features/directory/api/fetchVendors';
import { createClient } from '@/lib/supabase/client';
import { Vendor, VendorId } from "@/types/vendor";

export async function getFavoriteVendorIds(): Promise<VendorId[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return [];
  }

  const { data: favorites } = await supabase
    .from('user_favorites')
    .select('vendor_id')
    .eq('user_id', session.user.id)
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
  const vendors = await fetchAllVendors();
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