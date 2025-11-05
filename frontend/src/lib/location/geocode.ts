import { GeocodeResponse, LOCATION_TYPE_CITY, LOCATION_TYPE_STATE, LocationResult } from "@/types/location";
import { getDisplayName } from "./locationNames";


export async function rawPhotonFetch(encodedLocation: string, cityOnly: boolean): Promise<LocationResult[]> {
  console.debug(`Fetching Photon results for query: "${encodedLocation}"`);
  const url = cityOnly
    ? `https://photon.komoot.io/api/?q=${encodedLocation}&lang=en&limit=3&layer=city`
    : `https://photon.komoot.io/api/?q=${encodedLocation}&lang=en&limit=3&layer=city&layer=state&layer=country`;
  const res = await fetch(
    url,
    {
      headers: {
        "User-Agent": "AsianWeddingMakeup/1.0 (katrina@asianweddingmakeup.com)",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Photon API error: ${res.status}`);
  }

  const data = await res.json() as { features: GeocodeResponse[] };
  return data.features.map((feature) => {
    let state = feature.properties.state;
    if (feature.properties.type === LOCATION_TYPE_STATE) {
      state = feature.properties.state || feature.properties.name;
    }
    let city = feature.properties.city;
    if (feature.properties.type === LOCATION_TYPE_CITY) {
      city = feature.properties.city || feature.properties.name;
    }
    return ({
      display_name: getDisplayName(city, state, feature.properties.country, feature.properties.type),
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
      address: {
        city: city,
        state: state,
        country: feature.properties.country,
      },
      type: feature.properties.type || "unknown",
    })
  });
}
