import { useEffect, useRef, useMemo } from 'react';
import { debouncedTrackSearch, trackFiltersApplied } from '@/utils/analytics/trackFilterEvents';
import { FilterContext } from '@/features/directory/components/filters/FilterContext';

interface UseAnalyticsTrackingProps {
  searchParams: URLSearchParams;
  searchQuery: string;
  selectedLocationName: string | null;
  selectedSkills: string[];
  travelsWorldwide: boolean;
  sortOptionName: string;
  resultCount: number;
}

export function useAnalyticsTracking({
  searchParams,
  searchQuery,
  selectedLocationName,
  selectedSkills,
  travelsWorldwide,
  sortOptionName,
  resultCount,
}: UseAnalyticsTrackingProps) {
  const prevParamsRef = useRef<string | null>(null);

  // Create search params string - memoized to prevent unnecessary re-renders
  const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);

  // Create filter context - memoized to prevent unnecessary re-creation
  const filterContext: FilterContext = useMemo(() => ({
    selectedLocationName,
    selectedSkills,
    travelsWorldwide,
    searchQuery,
    sortOptionName,
    resultCount,
  }), [
    selectedLocationName,
    selectedSkills,
    travelsWorldwide,
    searchQuery,
    sortOptionName,
    resultCount,
  ]);

  useEffect(() => {
    const currentParams = searchParamsString;
    const prevParams = prevParamsRef.current;

    // Only track if this isn't the initial render
    if (prevParams !== null && currentParams !== prevParams) {
      // Determine if this was a search change vs other filter change
      const urlSearchQuery = searchParams.get('query') || "";
      const hasSearchChanged = searchQuery !== urlSearchQuery;

      if (hasSearchChanged) {
        console.debug('Analytics: Tracking search change', { searchQuery, filterContext });
        debouncedTrackSearch(filterContext);
      } else {
        console.debug('Analytics: Tracking filter change', { filterContext });
        trackFiltersApplied(filterContext);
      }
    }

    // Update previous params for next comparison
    prevParamsRef.current = currentParams;
  }, [
    searchParamsString,
    searchParams,
    searchQuery,
    filterContext, // This includes all the filter context dependencies
  ]);
}