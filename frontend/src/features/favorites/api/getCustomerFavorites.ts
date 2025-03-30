import { fetchCustomerById } from "@/features/business/api/fetchCustomer";
import { fetchAllVendors } from "@/features/directory/api/fetchVendors";
import { Vendor } from "@/types/vendor";
import { unstable_cache } from "next/cache";

const getCachedVendors = unstable_cache(fetchAllVendors);
const getCachedCustomer = unstable_cache(fetchCustomerById);

export async function getFavoritedVendors(customerId: string): Promise<Vendor[]> {
  const vendors = await getCachedVendors();
  const favoriteVendorIds = (await getCachedCustomer(customerId))?.favorite_vendors ?? new Set();
  return vendors.filter(vendor => {
    return vendor.id in favoriteVendorIds
  })
}