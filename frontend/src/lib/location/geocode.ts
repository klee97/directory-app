import { COUNTRY_ABBREVIATIONS, GeocodeResponse, LOCATION_TYPE_COUNTRY, LOCATION_TYPE_STATE, LocationResult, STATE_ABBREVIATIONS } from "@/types/location";

const PHOTON_TIMEOUT_MS = 2000;

async function fetchWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Photon API timeout")), timeoutMs)),
  ]);
}

async function rawPhotonFetch(query: string): Promise<LocationResult[]> {
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=en&limit=3&layer=city&layer=state&layer=country`,
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
    return ({
      display_name: getDisplayName(feature.properties.name, feature.properties.city, state, feature.properties.country, feature.properties.type),
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
      address: {
        city: feature.properties.city,
        state: state,
        country: feature.properties.country,
      },
      type: feature.properties.type || "unknown",
    })
  });
}

export async function fetchPhotonResults(query: string): Promise<LocationResult[]> {
  const tryFetch = async () => await fetchWithTimeout(rawPhotonFetch(query), PHOTON_TIMEOUT_MS);

  try {
    return await tryFetch();
  } catch (err) {
    console.warn("Photon API failed, retrying once:", err);
    try {
      return await tryFetch();
    } catch (retryErr) {
      console.error("Photon retry failed:", retryErr);
      return [];
    }
  }
}

export function getDisplayName(
  name: string | null,
  city: string | null,
  state: string | null,
  country: string | null,
  type: string
): string {
  const countryName = country ? COUNTRY_ABBREVIATIONS[country] || country : "";
  const stateName = state ? STATE_ABBREVIATIONS[state] || state : "";
  const cityName = city || name || "";
  if (type === LOCATION_TYPE_COUNTRY) {
    return countryName;
  } else if (type === LOCATION_TYPE_STATE) {
    return [state || cityName, countryName].filter(Boolean).join(", ");
  } else {
    return [cityName, stateName, countryName].filter(Boolean).join(", ");
  }
}
