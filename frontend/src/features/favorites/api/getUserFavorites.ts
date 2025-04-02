import { createClient } from '@/lib/supabase/client';
import { Vendor, VendorId } from "@/types/vendor";
import { fetchAllVendors } from "@/features/directory/api/fetchVendors";

export async function getFavoriteVendorIds(): Promise<VendorId[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: favorites } = await supabase
    .from('user_favorites')
    .select('vendor_id')
    .eq('user_id', user.id)
    .eq('is_favorited', true);

  return favorites?.map(f => f.vendor_id) ?? [];
}

// This type represents the serializable data we'll pass from server to client
type SerializedVendor = Omit<Vendor, 'specialties'> & {
  specialties: string[];
};

export async function getFavoriteVendors(): Promise<SerializedVendor[]> {
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
      ...vendor,
      specialties: Array.from(vendor.specialties)
    }));
}