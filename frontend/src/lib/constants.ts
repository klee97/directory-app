export const SEARCH_PARAM = 'query';
export const LOCATION_PARAM = 'region';
export const TRAVEL_PARAM = 'travelsWorldwide';
export const SKILL_PARAM = 'skill';

export type SearchParam = {
  query?: string;
  region?: string;
  travelsWorldwide?: string;
  skill?: string;
}

// Analytics IDs
export const DEFAULT_GTM_ID = "GTM-5SVLZR2M";
export const DEFAULT_CLARITY_ID = "qcfdyqnpxk";
export const DEFAULT_GA_ID = "G-7JZKX3Q1F4";