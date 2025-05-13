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

export const trackSearchQuery = (
  searchTerm: string,
  previousTerm: string | null = null,
  resultCount?: number
) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    const searchEvent: {
      event: string;
      search_term: string;
      previous_term: string;
      timestamp: string;
      result_count?: number;
      has_results?: boolean;
    } = {
      event: 'search_query',
      search_term: searchTerm || '',
      previous_term: previousTerm || '',
      timestamp: new Date().toISOString(),
    };
    
    // Add result count if provided
    if (resultCount !== undefined) {
      searchEvent.result_count = resultCount;
      searchEvent.has_results = resultCount > 0;
    }
    
    window.dataLayer.push(searchEvent);
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