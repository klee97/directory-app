import { Vendor } from "@/types/vendor";

export function searchVendors(searchQuery: string, vendors: Vendor[]) {
  const regex = new RegExp(searchQuery, "i"); // "i" makes it case-insensitive
  const results = vendors.filter(vendor =>
    regex.test(vendor.business_name?.toString() ?? '') ||
    regex.test(vendor.region?.toString() ?? '') ||
    regex.test(vendor.instagram?.toString() ?? '')
  );
  return results;
}