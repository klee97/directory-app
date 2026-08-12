export const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  "United States": "US",
  "United States of America": "US",
  "USA": "US",
  "Canada": "CA",
  "United Kingdom": "GB",
  "Singapore": "SG",
  "France": "FR",
  "Spain": "ES",
  "Germany": "DE",
  "Australia": "AU",
  "Portugal": "PT",
  "Philippines": "PH"
};

export function toIsoCountryCode(countryName: string | null | undefined): string | undefined {
  if (!countryName) return undefined;
  return COUNTRY_NAME_TO_ISO[countryName.trim()] ?? undefined;
}