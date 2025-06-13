export const LOCATION_TYPE_PRESET_REGION = "preset-region";
export const LOCATION_TYPE_STATE = "state";
export const LOCATION_TYPE_STATE_DISPLAY = "State";
export const LOCATION_TYPE_COUNTRY = "country";
export const LOCATION_TYPE_COUNTRY_DISPLAY = "Country";
export const LOCATION_TYPE_CITY = "city";

export const SEARCH_RADIUS_MILES_DEFAULT = 25;
export const SEARCH_VENDORS_LIMIT_DEFAULT = 200;
export const SEARCH_RESULTS_MINIMUM = 5;

export interface GeocodeResponse {
  type: string;
  geometry: {
    coordinates: number[];
    type: string;
  },
  properties: {
    city: string;
    state: string;
    country: string;
    name: string;
    type: string;
  }
}

export interface LocationResult {
  display_name: string;
  lat?: number;
  lon?: number;
  type?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  }
}

export interface LocationSearchOptions {
  limit?: number;
  countrycodes?: string[];
  addressdetails?: boolean;
  extratags?: boolean;
  namedetails?: boolean;
}

export const CITY_ABBREVIATIONS: Record<string, string> = {
  "City of New York": "New York City",
}

export const STATE_ABBREVIATIONS: Record<string, string> = {
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY",
};

export const COUNTRY_ABBREVIATIONS: Record<string, string> = {
  "United States": "USA",
};