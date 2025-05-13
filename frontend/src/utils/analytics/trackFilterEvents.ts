export const LOCATION_FILTER_NAME = 'region';
export const TRAVEL_FILTER_NAME = 'travelsWorldwide';

/**
 * Track filter changes in GTM
 * 
 * @param filterType - The type of filter being changed (e.g., 'location', 'category')
 * @param newValue - The new filter value
 */
export const trackFilterEvent = (filterType: string, newValue: string | null) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'filter_change',
      filter_type: filterType,
      new_value: newValue?.toString() || 'all',
    });
  }
};

/**
 * Helper method to track when filters are reset
 */
export const trackFilterReset = () => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'filter_reset',
      timestamp: new Date().toISOString()
    });
  }
};

// Types for analytics - helps ensure consistency
export type GTMFilterEvent = {
  event: 'filter_change';
  filter_type: string;
  new_value: string;
};