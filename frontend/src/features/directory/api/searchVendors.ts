import { supabase } from "@/lib/api-client";
import { LOCATION_TYPE_COUNTRY, LOCATION_TYPE_PRESET_REGION, LOCATION_TYPE_STATE, LocationResult, SEARCH_RADIUS_MILES_DEFAULT, SEARCH_RESULTS_MINIMUM, SEARCH_VENDORS_LIMIT_DEFAULT } from "@/types/location";
import { transformBackendVendorToFrontend, VendorByDistance } from "@/types/vendor";

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
  if (location.type === LOCATION_TYPE_PRESET_REGION) {
    return await filterVendorByRegion(location.display_name, vendors);
  } else if (isCountrySelection(location) && location.address?.country) {
    return filterVendorsByCountry(location, vendors);
  } else if (isStateSelection(location) && location.address?.state) {
    return filterVendorsByState(location, vendors);
  } else if (!!location.lat && !!location.lon) {
    return await getVendorsByDistanceWithFallback(location.lat, location.lon, SEARCH_RADIUS_MILES_DEFAULT, SEARCH_VENDORS_LIMIT_DEFAULT);
  } else {
    console.warn("Location type not recognized or missing coordinates:", location);
    return [];
  }
}

export function filterVendorsByState(location: LocationResult, vendors: VendorByDistance[]): VendorByDistance[] {
  if (!location.address?.state) {
    console.warn("No state provided in location:", location);
    return [];
  } 
  return vendors.filter(vendor =>
    vendor.state?.toLowerCase() === location.address?.state?.toLowerCase()
  );
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


export function filterVendorsByCountry(location: LocationResult, vendors: VendorByDistance[]): VendorByDistance[] {
  if (!location.address?.country) {
    console.warn("No country provided in location:", location);
    return [];
  } 
  return vendors.filter(vendor =>
    vendor.country?.toLowerCase() === location.address?.country?.toLowerCase()
  );
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
    .rpc("get_vendors_by_location_with_distinct_tags_and_media",
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

  return data.map(transformBackendVendorToFrontend) || [];
}

function isStateSelection(location: LocationResult) {
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
