
// Sort Options
export const SORT_OPTIONS = {
  DEFAULT: {
    name: 'default',
    display: 'Default',
  },
  DISTANCE_ASC: {
    name: 'distanceLowToHigh',
    display: 'Distance',
  },
  PRICE_ASC: {
    name: 'priceLowToHigh',
    display: 'Price (Low to High)',
  },
  PRICE_DESC: {
    name: 'priceHighToLow',
    display: 'Price (High to Low)',
  },
} as const;

// Extract the type of each option
export type SortOptionKey = keyof typeof SORT_OPTIONS;
export type SortOption = typeof SORT_OPTIONS[SortOptionKey];
export type SortOptionName = SortOption['name'];