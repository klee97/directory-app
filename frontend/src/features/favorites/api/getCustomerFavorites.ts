import { fetchCustomerById } from "@/features/business/api/fetchCustomer";
import { fetchAllVendors } from "@/features/directory/api/fetchVendors";
import { Vendor, VendorId } from "@/types/vendor";
import { unstable_cache } from "next/cache";

const getCachedVendors = unstable_cache(fetchAllVendors);
const getCachedCustomer = unstable_cache(fetchCustomerById);

export async function getFavoriteVendorIds(customerId: string): Promise<VendorId[]> {
  const customer = await getCachedCustomer(customerId);
  const favoriteVendorIds = customer?.favorite_vendors ?? [];
  return favoriteVendorIds
}

export async function getFavoriteVendors(customerId: string): Promise<Vendor[]> {
  const favoriteVendorIds = await getFavoriteVendorIds(customerId)
  if (favoriteVendorIds.length === 0) {
    console.debug("No favorite vendors found for customer with ID: %s", customerId);
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
    });
}