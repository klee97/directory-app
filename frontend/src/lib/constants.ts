export const SEARCH_PARAM = 'query';
export const LOCATION_PARAM = 'region';
export const TRAVEL_PARAM = 'travelsWorldwide';
export const SKILL_PARAM = 'skill';

export type SearchParam = {
  query?: string;
  region?: string;
  travelsWorldwide?: string;
  skill?: string[];
}