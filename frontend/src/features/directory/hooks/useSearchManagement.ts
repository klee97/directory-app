import { useRouter } from 'next/navigation';
import { SEARCH_PARAM } from '@/lib/constants';
import { useEffect, useState } from 'react';

export const useSearchManagement = ({
  searchParams
}: {
  searchParams: URLSearchParams,
}) => {
  const router = useRouter();

  const urlSearchQuery = searchParams.get(SEARCH_PARAM) || '';
  const [immediateSearchQuery, setImmediateSearchQuery] = useState<string | null>(null);

  // The effective search query - immediate takes priority, then URL
  const searchQuery = immediateSearchQuery !== null ? immediateSearchQuery : urlSearchQuery;

  const updateSearchQuery = (newQuery: string) => {
    console.trace('useSearchManagement URL update stack trace');
    setImmediateSearchQuery(newQuery);

    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set(SEARCH_PARAM, newQuery);
    } else {
      params.delete(SEARCH_PARAM);
    }

    const newUrl = `?${params.toString()}`;
    console.debug('Pushing new URL:', newUrl);
    router.push(newUrl, { scroll: false });
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