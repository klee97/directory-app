import { supabase } from "@/lib/api-client";
import { Vendor } from "@/types/vendor";

export function searchVendors(searchQuery: string, vendors: Vendor[]): Vendor[] {
  const regex = new RegExp(searchQuery, "i"); // "i" makes it case-insensitive
  const results = vendors.filter(vendor =>
    regex.test(vendor.business_name?.toString() ?? '') ||
    regex.test(vendor.region?.toString() ?? '') ||
    regex.test(vendor.metro?.toString() ?? '') ||
    regex.test(vendor.metro_region?.toString() ?? '') ||
    regex.test(vendor.instagram?.toString() ?? '')
  );
  return results;
}

export async function getVendorsByDistance(lat: number, lon: number, radiusMi = 25, limit = 150) {
  console.log("Fetching vendors by distance:", { lat, lon, radiusMi, limit });
  const { data, error } = await supabase
    .rpc("get_vendors_by_distance",
      {
        lat: lat,
        lon: lon,
        radius_miles: radiusMi,
        limit_results: limit
      }
    );

  if (error) { 
    console.error("Error fetching artists by distance:", error);
  }

  return data;
}