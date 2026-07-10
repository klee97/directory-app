import { fetchApi } from "@/lib/api/client";
import { DetailedSearchResult } from "@/types/location";
import { QUERY_PARAM, CITIES_ONLY_PARAM } from "@/lib/constants";

export async function fetchDetailedSearchResults(encodedQuery: string, citiesOnly?: boolean) {
  const params = new URLSearchParams({ [QUERY_PARAM]: encodedQuery });
  if (citiesOnly) params.set(CITIES_ONLY_PARAM, "true");

  return fetchApi<DetailedSearchResult>(`/api/search/detailed?${params}`);
}