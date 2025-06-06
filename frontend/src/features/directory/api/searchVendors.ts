import { supabase } from "@/lib/api-client";
import { LOCATION_TYPE_COUNTRY, LOCATION_TYPE_PRESET_REGION, LOCATION_TYPE_STATE, LocationResult, SEARCH_RADIUS_MILES_DEFAULT, SEARCH_RESULTS_MINIMUM, SEARCH_VENDORS_LIMIT_DEFAULT } from "@/types/location";
import { VendorByDistance } from "@/types/vendor";

export function searchVendors(searchQuery: string, vendors: VendorByDistance[]): VendorByDistance[] {
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

export async function getVendorsByLocation(location: LocationResult, vendors: VendorByDistance[] = []): Promise<VendorByDistance[]> {
  console.debug("Fetching vendors for location:", location);
  if (location.type === LOCATION_TYPE_PRESET_REGION) {
    return await filterVendorByRegion(location.display_name, vendors);
  } else if (isCountrySelection(location) && location.address?.country) {
    return await getVendorsByCountry(location);
  } else if (isStateSelection(location) && location.address?.state) {
    return await getVendorsByState(location);
  } else if (!!location.lat && !!location.lon) {
    return await getVendorsByDistanceWithFallback(location.lat, location.lon, SEARCH_RADIUS_MILES_DEFAULT, SEARCH_VENDORS_LIMIT_DEFAULT);
  } else {
    return [];
  }
}

export async function getVendorsByState(location: LocationResult) {
  if (!location.address?.state) {
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

export async function getVendorsByCountry(location: LocationResult) {
  if (!location.address?.country) {
    console.warn("No country provided in location:", location);
    return [];
  }

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .ilike('country', location.address.country);

  if (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
  return data;
}

export async function getVendorsByDistanceWithFallback(
  lat: number,
  lon: number,
  initialRadius = SEARCH_RADIUS_MILES_DEFAULT,
  limit = SEARCH_VENDORS_LIMIT_DEFAULT
)
  : Promise<VendorByDistance[]> {
  let radiusMi = initialRadius;
  let results: VendorByDistance[] = [];
  let attempts = 0;
  console.debug("Fetching vendors by distance:", { lat, lon, radiusMi, limit });

  while (results.length < SEARCH_RESULTS_MINIMUM && attempts < 3) { // Try up to 3 times
    results = await getVendorsByDistance(lat, lon, radiusMi, limit);
    radiusMi += SEARCH_RADIUS_MILES_DEFAULT; // Increase radius by 25 miles each time
    attempts++;
  }

  return results;
}

export async function getVendorsByDistance(
  lat: number,
  lon: number,
  radiusMi = SEARCH_RADIUS_MILES_DEFAULT,
  limit = SEARCH_VENDORS_LIMIT_DEFAULT
)
  : Promise<VendorByDistance[]> {
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

function isStateSelection(location: LocationResult) {
  console.debug("Checking if location is a state selection:", location);
  console.debug("is state selection:", location.type === LOCATION_TYPE_STATE);
  return (
    location.type === LOCATION_TYPE_STATE
  );
}

function isCountrySelection(location: LocationResult) {
  return (
    location.type === LOCATION_TYPE_COUNTRY
  );
}

async function filterVendorByRegion(region: string, vendors: VendorByDistance[]): Promise<VendorByDistance[]> {
  const results = vendors.filter(vendor =>
    vendor.metro_region?.toLowerCase().includes(region.toLowerCase())
  );
  return results;
}
