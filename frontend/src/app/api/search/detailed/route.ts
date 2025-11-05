import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { rawPhotonFetch } from "@/lib/location/geocode";
import { LocationResult } from "@/types/location";
import { fetchPhotonResults } from "@/lib/location/photonUtils";

function normalizeString(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const detailedCache = new LRUCache<string, { locations: LocationResult[], success: boolean }>({
  max: 100,
  ttl: 1000 * 60 * 60 * 24, // 24 hours for successful results
});

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.get("q")?.trim() || "";
  const citiesOnly = new URL(request.url).searchParams.get("citiesOnly") === "true";
  const normalizedQuery = normalizeString(query);
  const cacheKey = normalizedQuery + (citiesOnly ? "_citiesOnly" : "");

  // Check cache first
  const cached = detailedCache.get(cacheKey);
  if (cached) {
    return NextResponse.json({
      locations: cached.locations,
      query: normalizedQuery,
      success: cached.success,
      cached: true
    });
  }

  try {
    const locations = await fetchPhotonResults(() => rawPhotonFetch(query, citiesOnly));
    console.debug(`Detailed search success for "${query}":`, locations.length, "results");

    const result = { locations, success: true };
    detailedCache.set(cacheKey, result);
    const filteredLocations = citiesOnly
      ? locations.filter(loc => loc.type === 'city')
      : locations;
    return NextResponse.json({
      filteredLocations,
      query: normalizedQuery,
      success: true,
      cached: false
    });

  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    console.warn(`Detailed search failed for "${query}":`, errorMessage);

    // Cache the failure for a shorter time to avoid repeated calls
    const failureResult = { locations: [], success: false };
    detailedCache.set(normalizedQuery, failureResult);

    return NextResponse.json({
      locations: [],
      query: normalizedQuery,
      success: false,
      error: errorMessage,
      cached: false
    });
  }
}