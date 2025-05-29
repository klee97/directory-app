import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { stateAbbreviations, NominatimResponse } from "@/types/location";


interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

const cache = new LRUCache<string, NominatimResult[]>({
  max: 100,
  ttl: 1000 * 60 * 60 * 24 // 24 hour cache
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 3) {
    return NextResponse.json(
      { error: "Query param 'q' is required and min length 3" },
      { status: 400 }
    );
  }

  const query = q.trim().toLowerCase();

  const cached = cache.get(query);
  if (cached) {
    console.log("Returning cached results for query:", query);
    return NextResponse.json(cached);
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=5&countrycodes=us,ca&addressdetails=1&accept-language=en`;

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "DirectoryApp/1.0 (katrina@asianweddingmakeup.com)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from Nominatim" },
        { status: 500 }
      );
    }

    const data = (await response.json()) as NominatimResponse[];

    const filtered = data
      .map((place) => {
        const { address } = place;
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          "";
        const state = address.state || "";
        const stateAbbr = stateAbbreviations[state] || state;
        const country = address.country || "";
        let display_name;
        if (!!city && !!stateAbbr) {
          display_name = [city, stateAbbr, "USA"].filter(Boolean).join(", ");
        } else {
          display_name = [city, state, country].filter(Boolean).join(", ");
        }
        return {
          display_name,
          lat: place.lat,
          lon: place.lon,
          address: {
            city: address.city || address.town || address.village || "",
            state: address.state || "",
            country: address.country || "",
          },
          type: place.type || "unknown",
        };
      });
    console.log("Nominatim results:", filtered);
    cache.set(query, filtered);

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Nominatim API error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
