import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { getCachedVendors } from "@/features/directory/api/fetchVendors";
import { unstable_cache } from "next/cache";
import { LOCATION_TYPE_PRESET_REGION, LocationResult } from "@/types/location";
import { fetchPhotonResults } from "@/lib/location/geocode";
import { serverLocationCache } from "@/lib/location/ServerLocationCache";

function normalizeString(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const getCachedRegions = unstable_cache(async () => {
  const vendors = await getCachedVendors();
  const uniqueRegions = Array.from(
    new Map(
      vendors
        .filter((v) => v.metro_region !== null)
        .map((v) => [v.metro_region, { display_name: v.metro_region || "", type: LOCATION_TYPE_PRESET_REGION }])
    ).values()
  );

  return uniqueRegions.sort((a, b) => a.display_name.localeCompare(b.display_name));
}, ["vendor-regions"], { revalidate: 86400 });

const cache = new LRUCache<string, { matchingRegions: LocationResult[], matchingLocations: LocationResult[] }>({
  max: 100,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() || "";
  const normalizedQuery = normalizeString(query);
  const allRegions = await getCachedRegions();

  if (!query) {
    return NextResponse.json({ matchingRegions: allRegions, matchingLocations: [] });
  }

  const cached = cache.get(normalizedQuery);
  if (cached) {
    return NextResponse.json(cached);
  }

  const matchingRegions = allRegions.filter((r) => r.display_name.toLowerCase().includes(normalizedQuery));
  let matchingLocations: LocationResult[] = [];

  if (query.length >= 3) {
    try {
      matchingLocations = await fetchPhotonResults(query);
      matchingLocations.forEach(location => {
        serverLocationCache.set(encodeURIComponent(location.display_name), location, 'user_selection');
      });
    } catch (error) {
      console.error("Photon error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  const result = { matchingRegions, matchingLocations };
  cache.set(normalizedQuery, result);
  console.debug("Location suggestions cache set for query:", normalizedQuery, "->", result);
  return NextResponse.json(result);
}
