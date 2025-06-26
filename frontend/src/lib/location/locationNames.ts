import { CITY_ABBREVIATIONS, COUNTRY_ABBREVIATIONS, LOCATION_TYPE_COUNTRY, LOCATION_TYPE_STATE, STATE_ABBREVIATIONS } from "@/types/location";

export function getDisplayName(
  city: string | null,
  state: string | null,
  country: string | null,
  type: string
): string {
  const countryName = country ? COUNTRY_ABBREVIATIONS[country] || country : "";
  const stateName = state ? STATE_ABBREVIATIONS[state] || state : "";
  const cityName = city ? CITY_ABBREVIATIONS[city] || city : "";
  if (type === LOCATION_TYPE_COUNTRY) {
    return countryName;
  } else if (type === LOCATION_TYPE_STATE) {
    return [state || cityName, countryName].filter(Boolean).join(", ");
  } else {
    return [cityName, stateName, countryName].filter(Boolean).join(", ");
  }
}
