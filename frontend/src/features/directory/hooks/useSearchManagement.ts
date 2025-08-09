import { SEARCH_PARAM } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { useURLFiltersContext } from '@/contexts/URLFiltersContext';

export const useSearchManagement = () => {
  const { getParam, setParam } = useURLFiltersContext();

  const urlSearchQuery = getParam(SEARCH_PARAM) || "";
  const [immediateSearchQuery, setImmediateSearchQuery] = useState<string | null>(null);

  // The effective search query - immediate takes priority, then URL
  const searchQuery = immediateSearchQuery !== null ? immediateSearchQuery : urlSearchQuery;

  const updateSearchQuery = (newQuery: string) => {
    console.trace('useSearchManagement URL update stack trace');
    setImmediateSearchQuery(newQuery);
    setParam(SEARCH_PARAM, newQuery || null);
  };

  // Clear immediate state when URL catches up
  useEffect(() => {
    if (immediateSearchQuery !== null && urlSearchQuery === immediateSearchQuery) {
      setImmediateSearchQuery(null);
    }
  }, [urlSearchQuery, immediateSearchQuery]);

  return {
    searchQuery,
    updateSearchQuery
  };
}