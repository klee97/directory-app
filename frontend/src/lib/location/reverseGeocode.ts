import { GeocodeResponse, LOCATION_TYPE_CITY, LOCATION_TYPE_COUNTRY, LOCATION_TYPE_STATE, LocationResult, PRECISE_COUNTRY_CODES } from "@/types/location";
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

  const city = props.type === LOCATION_TYPE_CITY ? (props.city || props.name) : props.city;
  const state = props.type === LOCATION_TYPE_STATE ? (props.state || props.name) : props.state;
  const country = props.type === LOCATION_TYPE_COUNTRY ? (props.country || props.name) : props.country;
  const countryCode = props.countrycode?.toUpperCase();
  const isPreciseCountry = countryCode ? PRECISE_COUNTRY_CODES.has(countryCode) : false;

  if (!city && !state) {
    // No city/state nearby. For the US/Canada we still want that level of
    // precision — falling back to country there ("United States") would be
    // too coarse to be useful. Elsewhere, given our vendor coverage is
    // sparse outside North America, country-level is good enough to be a
    // usable result rather than a dead end.
    if (country && !isPreciseCountry) {
      return {
        display_name: getDisplayName(undefined, undefined, country, LOCATION_TYPE_COUNTRY),
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        address: { country },
        type: LOCATION_TYPE_COUNTRY,
      };
    }
    return null;
  }

  const resolvedType = city ? LOCATION_TYPE_CITY : LOCATION_TYPE_STATE;

  return {
    display_name: getDisplayName(city, state, country, resolvedType),
    lat: feature.geometry.coordinates[1],
    lon: feature.geometry.coordinates[0],
    address: {
      city,
      state,
      country,
    },
    type: resolvedType,
  };
}