import debounce from 'lodash.debounce';

export const LOCATION_FILTER_NAME = 'region';
export const TRAVEL_FILTER_NAME = 'travelsWorldwide';
export const SKILL_FILTER_NAME = 'skill';

/**
 * Track filter changes in GTM
 * 
 * @param filterType - The type of filter being changed (e.g., 'location', 'category')
 * @param newValue - The new filter value
 * @param resultCount - The number of results after applying the filter
 */
export const trackFilterEvent = (
  filterType: string,
  newValue: string | null,
  resultCount?: number
) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'filter_change',
      filter_type: filterType,
      new_value: newValue?.toString() || 'all',
      result_count: resultCount ?? 0,
      has_results: resultCount ? resultCount > 0 : false,
    });
  }
};

export const trackFiltersApplied = (
  region: string,
  skill: string,
  travelsWorldwide: boolean,
  searchTerm: string,
  sortOption: string,
  resultCount: number
) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'filter_applied',
      region: region,
      skill: skill,
      travels_worldwide: travelsWorldwide,
      search_term: searchTerm,
      sort_option: sortOption,
      result_count: resultCount ?? 0,
      has_results: resultCount ? resultCount > 0 : false,
    });
  }
}

export const debouncedTrackSearch = debounce((params) => {
  trackFiltersApplied(
    params.selectedRegion,
    params.selectedSkill,
    params.travelsWorldwide,
    params.searchQuery,
    params.sortOption,
    params.resultCount
  );
}, 500);

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
      result_count?: number;
      has_results?: boolean;
    } = {
      event: 'search_query',
      search_term: searchTerm || '',
      previous_term: previousTerm || '',
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
      event: 'filter_reset'
    });
  }
};