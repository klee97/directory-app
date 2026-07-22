import { GeocodeResponse, LOCATION_TYPE_CITY, LOCATION_TYPE_STATE, LocationResult } from "@/types/location";
import { getDisplayName } from "./locationNames";

export async function rawReversePhotonFetch(lat: number, lon: number): Promise<LocationResult | null> {
  console.debug(`Fetching reverse Photon results for lat and lon: (${lat}, ${lon})`);
  const res = await fetch(
    `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&lang=en&limit=1`,
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
    return null; // no feature at all near this point (e.g. open ocean)
  }

  const props = feature.properties;

  // The nearest feature is often a house/POI/street, not itself a city or
  // state — but Photon annotates every feature with its containing
  // city/state/country regardless of the feature's own type. If the
  // feature IS itself a city or state, prefer its own `name` for that
  // field (handles cases where `city`/`state` properties are absent on
  // the feature representing the city/state itself).
  const city = props.type === LOCATION_TYPE_CITY ? (props.city || props.name) : props.city;
  const state = props.type === LOCATION_TYPE_STATE ? (props.state || props.name) : props.state;

  if (!city && !state) {
    // Nearest feature exists but carries no city or state (e.g. deep
    // rural/unindexed area) — nothing usable to report.
    return null;
  }

  const resolvedType = city ? LOCATION_TYPE_CITY : LOCATION_TYPE_STATE;

  return {
    display_name: getDisplayName(city, state, props.country, resolvedType),
    lat: feature.geometry.coordinates[1],
    lon: feature.geometry.coordinates[0],
    address: {
      city,
      state,
      country: props.country,
    },
    type: resolvedType,
  };
}