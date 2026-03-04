import { SEARCH_PARAM } from '@/lib/constants';
import { useURLFiltersContext } from '@/contexts/URLFiltersContext';
import { useState } from 'react';

export const useSearchManagement = () => {
  const { getParam, setParam } = useURLFiltersContext();

  const urlSearchQuery = getParam(SEARCH_PARAM) || "";
  const [immediateSearchQuery, setImmediateSearchQuery] = useState<string | null>(null);

  const searchQuery = immediateSearchQuery !== null ? immediateSearchQuery : urlSearchQuery;

  const updateSearchQuery = (newQuery: string) => {
    setImmediateSearchQuery(newQuery);
    setParam(SEARCH_PARAM, newQuery || null);
  };

  return { searchQuery, updateSearchQuery };
}