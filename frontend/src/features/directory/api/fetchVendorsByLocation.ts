"use server";
import { supabase } from "@/lib/api-client";
import { shouldIncludeTestVendors } from "@/lib/env/env";
import { filterTestVendors } from "@/lib/vendor/testVendors";
import {
  LocationResult,
  SEARCH_RADIUS_MILES_DEFAULT,
  SEARCH_RESULTS_MINIMUM,
  SEARCH_VENDORS_LIMIT_DEFAULT,
} from "@/types/location";
import { BackendVendor, transformBackendVendorToFrontend, VendorByDistance } from "@/types/vendor";
import { unstable_cache } from "next/cache";

const CACHE_TTL = 3600 * 24; // 24 hours
const SEARCH_QUERY = `
  *,
  tags (id, display_name, name, type, is_visible, style),
  vendor_media (id, media_url, is_featured, consent_given, credits)
`;

// ─── Helpers ────────────────────────────────────────────────────────────────
function buildVendorQuery() {
  const query = supabase.from("vendors").select(SEARCH_QUERY);
  return shouldIncludeTestVendors() ? query : query.not("id", "like", "TEST-%");
}

// ─── By Location (distance) ──────────────────────────────────────────────────

// Inner cached fetch — throws on error so Next.js does NOT cache bad results
const _getVendorsByDistance = unstable_cache(
  async (lat: number, lon: number, radiusMi: number, limit: number, _includeTestVendors: boolean): Promise<VendorByDistance[]> => {
    const { data, error } = await supabase.rpc(
      "get_vendors_by_location_with_distinct_tags_and_media_v2",
      { lat, lon, radius_miles: radiusMi, limit_results: limit }
    );

    if (error) {
      // Throwing prevents this result from being stored in the cache
      throw new Error(`Error fetching vendors by distance: ${error.message}`);
    }

    // data could be null even without an explicit error
    if (!data) {
      throw new Error("No data returned from vendors-by-distance RPC");
    }

    return filterTestVendors(data as BackendVendor[]).map(transformBackendVendorToFrontend);
  },
  ["vendors-by-distance"],
  { revalidate: CACHE_TTL, tags: ["all-vendors"] }
);

export async function getVendorsByDistance(
  lat: number,
  lon: number,
  radiusMi = SEARCH_RADIUS_MILES_DEFAULT,
  limit = SEARCH_VENDORS_LIMIT_DEFAULT
): Promise<VendorByDistance[]> {
  try {
    return await _getVendorsByDistance(lat, lon, radiusMi, limit, shouldIncludeTestVendors());
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getVendorsByDistanceWithFallback(
  lat: number,
  lon: number,
  initialRadius = SEARCH_RADIUS_MILES_DEFAULT,
  limit = SEARCH_VENDORS_LIMIT_DEFAULT
): Promise<VendorByDistance[]> {
  let radiusMi = initialRadius;
  let results: VendorByDistance[] = [];
  let attempts = 0;

  while (results.length < SEARCH_RESULTS_MINIMUM && attempts < 3) {
    results = await getVendorsByDistance(lat, lon, radiusMi, limit);
    radiusMi += SEARCH_RADIUS_MILES_DEFAULT;
    attempts++;
  }

  return results;
}

export async function getVendorsByLocation(location: LocationResult): Promise<VendorByDistance[]> {
  if (location.lat && location.lon) {
    return getVendorsByDistanceWithFallback(
      location.lat,
      location.lon,
      SEARCH_RADIUS_MILES_DEFAULT,
      SEARCH_VENDORS_LIMIT_DEFAULT
    );
  }
  console.warn("Location missing coordinates:", location);
  return [];
}

// ─── By State ────────────────────────────────────────────────────────────────

const _getVendorsByState = unstable_cache(
  async (state: string, _includeTestVendors: boolean) => {
    const { data, error } = await buildVendorQuery().ilike("state", state);

    if (error) throw new Error(`Error fetching vendors by state: ${error.message}`);
    if (!data) throw new Error("No data returned from vendors-by-state query");

    return data;
  },
  ["vendors-by-state"],
  { revalidate: CACHE_TTL, tags: ["all-vendors"] }
);

export async function getVendorsByState(location: LocationResult) {
  if (!location.address?.state) {
    console.warn("No state in location:", location);
    return [];
  }
  try {
    return await _getVendorsByState(location.address.state, shouldIncludeTestVendors());
  } catch (err) {
    console.error(err);
    return [];
  }
}

// ─── By Country ───────────────────────────────────────────────────────────────

const _getVendorsByCountry = unstable_cache(
  async (country: string, _includeTestVendors: boolean) => {
    const { data, error } = await buildVendorQuery().ilike("country", country);

    if (error) throw new Error(`Error fetching vendors by country: ${error.message}`);
    if (!data) throw new Error("No data returned from vendors-by-country query");

    return data;
  },
  ["vendors-by-country"],
  { revalidate: CACHE_TTL, tags: ["all-vendors"] }
);

export async function getVendorsByCountry(location: LocationResult) {
  if (!location.address?.country) {
    console.warn("No country in location:", location);
    return [];
  }
  try {
    return await _getVendorsByCountry(location.address.country, shouldIncludeTestVendors());
  } catch (err) {
    console.error(err);
    return [];
  }
}