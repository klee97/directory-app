import { GeocodeResponse, LOCATION_TYPE_CITY, LOCATION_TYPE_STATE, LocationResult } from "@/types/location";
import { getDisplayName } from "./locationNames";

export async function rawReversePhotonFetch(lat: number, lon: number): Promise<LocationResult> {
  console.debug(`Fetching reverse Photon results for lat and lon: (${lat}, ${lon})`);
  const res = await fetch(
    `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&lang=en&limit=3&layer=city&layer=state&layer=country`,
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
  const feature = data.features?.[0];
  if (!feature) {
    throw new Error("No results found");
  }

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

}
