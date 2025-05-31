import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { stateAbbreviations, GeocodeResponse, LocationResult, LOCATION_TYPE_PRESET_REGION, countryAbbreviations, LOCATION_TYPE_COUNTRY, LOCATION_TYPE_STATE, LOCATION_TYPE_CITY } from "@/types/location";
import { getCachedVendors } from "@/features/directory/api/fetchVendors";
import { unstable_cache } from "next/cache";

const getCachedRegions: () => Promise<LocationResult[]> = unstable_cache(
  async () => {
    const vendors = await getCachedVendors();
    const uniqueRegions = Array.from(
      new Map(
        vendors
          .filter((v) => v.metro_region !== null)
          .map((v) => [v.metro_region, { display_name: v.metro_region || "", type: LOCATION_TYPE_PRESET_REGION }])
      ).values()
    );

    return uniqueRegions.sort((a, b) => a.display_name.localeCompare(b.display_name));

  },
  ["vendor-regions"],
  { revalidate: 60 * 60 * 24 } // Cache for 24 hours
);

const cache = new LRUCache<string, { matchingRegions: LocationResult[], matchingLocations: LocationResult[] }>({
  max: 100,
  ttl: 1000 * 60 * 60 * 24 // 24 hour cache
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const query = q?.trim().toLowerCase();
  const allRegions = await getCachedRegions();
  console.debug("Received query:", query);
  if (query !== undefined && query.length > 0) {
    const cached = cache.get(query);
    if (cached) {
      return NextResponse.json(cached);
    } else {
      const matchingRegions = allRegions
        .filter((r) => r.display_name?.toLowerCase().includes(query));

      let matchingLocations: LocationResult[] = [];
      if (query.length >= 3) {
        try {
          // const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          //   query
          // )}&limit=10&addressdetails=1&accept-language=en`;
          const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=en&limit=5&layer=city&layer=state&layer=country`;
          const response = await fetch(photonUrl, {
            headers: {
              "User-Agent": "DirectoryApp/1.0 (katrina@asianweddingmakeup.com)",
            },
          });

          if (!response.ok) {
            console.error("Photon API error:", response.statusText);
          }
          const data = (await response.json()) as { features: GeocodeResponse[] };

          matchingLocations = data.features
            .map((place) => {
              const display_name = getDisplayName(
                place.properties.name,
                place.properties.city,
                place.properties.state,
                place.properties.country,
                place.properties.type
              );
              return {
                display_name,
                lat: place.geometry.coordinates[0],
                lon: place.geometry.coordinates[1],
                address: {
                  city: place.properties.city,
                  state: place.properties.state,
                  country: place.properties.country,
                },
                type: place.properties.type || "unknown",
              };
            });
          console.debug("Nominatim results:", matchingLocations);
        } catch (error) {
          console.error("Nominatim API error", error);
          return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          );
        }
      }
      const fullResults = { matchingRegions, matchingLocations };
      cache.set(query, fullResults);

      return NextResponse.json(fullResults);


    }
  } else {
    console.debug("No query provided, returning all regions");
    return NextResponse.json({ matchingRegions: allRegions, matchingLocations: [] });
  }
}

function getDisplayName(
  name: string | null,
  city: string | null,
  state: string | null,
  country: string | null,
  type: string
): string {
  const countryName = country ? countryAbbreviations[country] || country : "";
  const stateName = state ? stateAbbreviations[state] || state : "";
  const cityName = city || name || "";
  if (type === LOCATION_TYPE_COUNTRY) {
    return countryName;
  } else if (type === LOCATION_TYPE_STATE) {
    return [stateName || cityName, countryName].filter(Boolean).join(", ");
  } else if (type === LOCATION_TYPE_CITY) {
    return [cityName, stateName, countryName].filter(Boolean).join(", ");
  } else {
    return [cityName, stateName, countryName].filter(Boolean).join(", ");
  }
}