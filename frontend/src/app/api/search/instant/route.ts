import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { LocationResult } from "@/types/location";
import { POPULATED_LOCATIONS } from "@/lib/location/populated-cities";

function normalizeString(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const instantCache = new LRUCache<string, LocationResult[]>({
  max: 200,
  ttl: 1000 * 60 * 60 * 12, // 24 hours
});

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() || "";
  const citiesOnly = new URL(request.url).searchParams.get("citiesOnly") === "true";

  // Return popular cities if no query
  if (!query) {
    const allCities: LocationResult[] = POPULATED_LOCATIONS;
    const popularCities = allCities
      .slice(0, 15);

    return NextResponse.json({
      locations: popularCities,
      query: "",
      cached: false
    });
  }

  const normalizedQuery = normalizeString(query);
  console.debug(`Instant search received query: "${query}" normalized to "${normalizedQuery}"`);

  const cacheKey = normalizedQuery + (citiesOnly ? "_citiesOnly" : "");

  // Check cache
  const cached = instantCache.get(cacheKey);
  if (cached) {
    return NextResponse.json({
      locations: cached,
      query: normalizedQuery,
      cached: true
    });
  }

  const matchingLocations = POPULATED_LOCATIONS
    .filter(location =>
      location.display_name.toLowerCase().includes(normalizedQuery)
      || (location.address?.city && normalizeString(location.address.city).includes(normalizedQuery))
      || (location.address?.state && normalizeString(location.address.state).includes(normalizedQuery))
      || (location.address?.country && normalizeString(location.address.country).includes(normalizedQuery))
    )
    .slice(0, 5);
  const filteredLocations = citiesOnly
    ? matchingLocations.filter(loc => loc.type === 'city')
    : matchingLocations;
  instantCache.set(cacheKey, filteredLocations);
  console.debug(`Instant search cache set for query: "${cacheKey}" -> ${filteredLocations.length} results`);
  return NextResponse.json({
    locations: filteredLocations,
    query: normalizedQuery,
    cached: false
  });
}