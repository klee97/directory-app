import { supabase } from "@/lib/api-client";
import { LocationResult } from "@/types/location";
import { Vendor, VendorByDistance } from "@/types/vendor";

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

function isStateOnlySelection(location: LocationResult) {
  return (
    !location.address.city && location.address.state !== undefined && location.type === 'administrative'
  );
}

export async function getVendorsByLocation(location: LocationResult) {
  console.log("Fetching vendors for location:", location);

  if (isStateOnlySelection(location) && location.address?.state) {
    console.log("Fetching vendors by state:", location.address.state);
    return await getVendorsByState(location);
  } else {
    return await getVendorsByDistance(location, 25, 150);
  }
}

export async function getVendorsByState(location: LocationResult) {
  if (!location.address.state) {
    console.warn("No state provided in location:", location);
    return [];
  }

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .ilike('state', location.address.state); 

  if (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
  return data;
}

export async function getVendorsByDistance(location: LocationResult, radiusMi = 25, limit = 150)
: Promise<VendorByDistance[]> {
  const lat = parseFloat(location.lat);
  const lon = parseFloat(location.lon);
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