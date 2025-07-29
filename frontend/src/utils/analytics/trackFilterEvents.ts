import { FilterContext } from '@/features/directory/components/filters/FilterContext';
import debounce from 'lodash.debounce';

export const LOCATION_FILTER_NAME = 'region';
export const TRAVEL_FILTER_NAME = 'travelsWorldwide';
export const SKILL_FILTER_NAME = 'skill';

/**
 * Track filter changes in GTM
 * 
 * @param filterType - The type of filter being changed (e.g., 'location', 'category')
 * @param newValue - The new filter value
 */
export const trackFilterEvent = (
  filterType: string,
  newValue: string | string[] | null,
) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'filter_change',
      filter_type: filterType,
      new_value: newValue?.toString() || 'all'
    });
  }
};

export const trackFiltersApplied = (
  filterContext: FilterContext
) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'filters_applied',
      region: filterContext.selectedLocationName || "",
      skill: filterContext.selectedSkills,
      travels_worldwide: filterContext.travelsWorldwide,
      search_term: filterContext.searchQuery || "",
      sort_option: filterContext.sortOptionName || "",
      result_count: filterContext.resultCount ?? 0,
      has_results: filterContext.resultCount ? filterContext.resultCount > 0 : false,
    });
  }
}

export const debouncedTrackSearch = debounce((filterContext: FilterContext) => {
  trackFiltersApplied(filterContext);
}, 500);

export const trackSearchQuery = (
  searchTerm: string,
  previousTerm: string | null = null,
) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    const searchEvent: {
      event: string;
      search_term: string;
      previous_term: string;
    } = {
      event: 'search_query',
      search_term: searchTerm || '',
      previous_term: previousTerm || '',
    };
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