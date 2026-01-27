"use server";
import { supabase } from "@/lib/api-client";
import { shouldIncludeTestVendors } from "@/lib/env/env";
import { LocationResult, SEARCH_RADIUS_MILES_DEFAULT, SEARCH_RESULTS_MINIMUM, SEARCH_VENDORS_LIMIT_DEFAULT } from "@/types/location";
import { transformBackendVendorToFrontend, VendorByDistance } from "@/types/vendor";
import { unstable_cache } from "next/cache";

const SEARCH_QUERY = `
      *,
      tags (id, display_name, name, type, is_visible, style),
      vendor_media (id, media_url)
      `;

export async function getVendorsByLocation(location: LocationResult): Promise<VendorByDistance[]> {
  if (!!location.lat && !!location.lon) {
    return await getVendorsByDistanceWithFallback(location.lat, location.lon, SEARCH_RADIUS_MILES_DEFAULT, SEARCH_VENDORS_LIMIT_DEFAULT);
  } else {
    console.warn("Location type not recognized or missing coordinates:", location);
    return [];
  }
}

export const getVendorsByState = unstable_cache(
  async (location: LocationResult) => {
    if (!location.address?.state) {
      console.warn("No state provided in location:", location);
      return [];
    }

    let query = supabase
      .from('vendors')
      .select(SEARCH_QUERY)

    if (!shouldIncludeTestVendors()) {
      query = query.not('id', 'like', 'TEST-%');
    }
    const { data, error } = await query
      .ilike('state', location.address.state);

    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
    return data;
  },
  ['vendors-by-state'],
  {
    revalidate: 3600 * 24, // 24 hours
    tags: ['all-vendors']
  }
);

export const getVendorsByCountry = unstable_cache(
  async (location: LocationResult) => {
    if (!location.address?.country) {
      console.warn("No country provided in location:", location);
      return [];
    }

    let query = supabase
      .from('vendors')
      .select(SEARCH_QUERY)

    if (!shouldIncludeTestVendors()) {
      query = query.not('id', 'like', 'TEST-%');
    }
    const { data, error } = await query
      .ilike('country', location.address.country);

    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
    return data;
  },
  ['vendors-by-country'],
  {
    revalidate: 3600 * 24, // 24 hours
    tags: ['all-vendors']
  }
);

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

export const getVendorsByDistance = unstable_cache(
  async (
    lat: number,
    lon: number,
    radiusMi = SEARCH_RADIUS_MILES_DEFAULT,
    limit = SEARCH_VENDORS_LIMIT_DEFAULT
  ) => {

    const { data, error } = await supabase
      .rpc("get_vendors_by_location_with_distinct_tags_and_media",
        {
          lat: lat,
          lon: lon,
          radius_miles: radiusMi,
          limit_results: limit
        }
      );

    const filteredData = shouldIncludeTestVendors()
      ? data
      : data?.filter((vendor: VendorByDistance) => !vendor.id.startsWith('TEST-'));
    if (error) {
      console.error("Error fetching artists by distance:", error);
    }

    return filteredData.map(transformBackendVendorToFrontend) || [];
  },
  ['vendors-by-distance'],
  {
    revalidate: 3600 * 24, // 24 hour
    tags: ['all-vendors']
  }
);
