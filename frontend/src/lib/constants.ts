// filterable table search params
export const SEARCH_PARAM = 'query';
export const LOCATION_PARAM = 'region';
export const TRAVEL_PARAM = 'travelsWorldwide';
export const SKILL_PARAM = 'skill';
export const SERVICE_PARAM = 'service';

// location search params
export const CITIES_ONLY_PARAM = 'citiesOnly';
export const QUERY_PARAM = 'q';

export const LATITUDE_PARAM = 'lat';
export const LONGITUDE_PARAM = 'lon';

// magic link params
export const SLUG_PARAM = 'slug';
export const EMAIL_PARAM = 'email';
export const TOKEN_PARAM = 'token';

export type SearchParam = {
  query?: string;
  region?: string;
  travelsWorldwide?: string;
  skill?: string[];
}

// Analytics IDs
export const DEFAULT_GTM_ID = "GTM-5SVLZR2M";
export const DEFAULT_CLARITY_ID = "qcfdyqnpxk";
export const DEFAULT_GA_ID = "G-7JZKX3Q1F4";

// Behold IG feed ID
export const BEHOLD_IG_FEED_ID = "8Q1CY0ikGsl59jcJbjL8";