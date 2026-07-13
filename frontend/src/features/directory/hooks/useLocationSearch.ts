import { useState, useEffect, useRef } from 'react';
import { fetchApi } from '@/lib/api/client';
import { DetailedSearchResult, LocationResult } from '@/types/location';
import { CITIES_ONLY_PARAM, QUERY_PARAM } from '@/lib/constants';

interface SearchResults {
    // Instant results (0ms) - unified locations
    instantLocations: LocationResult[];

    // Detailed results (0-5s)
    detailedLocations: LocationResult[];

    // Loading states
    isInstantLoading: boolean;
    isDetailedLoading: boolean;

    // Status
    detailedSuccess: boolean;
    detailedError?: string;
}

const defaultEmptyResults = {
    instantLocations: [],
    detailedLocations: [],
    isInstantLoading: false,
    isDetailedLoading: false,
    detailedSuccess: false,
};

interface UseLocationSearchOptions {
    citiesOnly?: boolean;
}

export function useLocationSearch(query: string, { citiesOnly = false }: UseLocationSearchOptions): SearchResults {
    const [results, setResults] = useState<SearchResults>(defaultEmptyResults);

    // Use ref to track the current query to prevent race conditions
    const currentQueryRef = useRef<string>('');
    const trimmedQuery = query.trim();


    useEffect(() => {
        currentQueryRef.current = trimmedQuery;

        if (!trimmedQuery) {
            return;
        }

        const buildUrl = (base: string, encodedQuery: string) =>
            `${base}?${QUERY_PARAM}=${encodedQuery}${citiesOnly ? `&${CITIES_ONLY_PARAM}=true` : ''}`;

        const fetchInstantResults = async (encodedQuery: string, originalQuery: string) => {
            console.debug('Fetching instant results for encoded query:', encodedQuery);

            const response = await fetchApi<DetailedSearchResult>(buildUrl('/api/search/instant', encodedQuery));

            if (currentQueryRef.current !== originalQuery) return;

            setResults(prev => ({
                ...prev,
                instantLocations: response.ok ? response.data.locations : [],
                isInstantLoading: false,
            }));
        };

        const fetchDetailedResults = async (encodedQuery: string, originalQuery: string) => {
            console.debug('Fetching detailed results for query:', encodedQuery);

            const response = await fetchApi<DetailedSearchResult>(buildUrl('/api/search/detailed', encodedQuery));

            // Only update if this is still the current query
            if (currentQueryRef.current === originalQuery) {
                setResults(prev => ({
                    ...prev,
                    detailedLocations: response.ok ? response.data.locations : [],
                    detailedSuccess: response.ok,
                    detailedError: response.ok ? undefined : response.error,
                    isDetailedLoading: false,
                }));
            }
        }

        // Clear previous results and set loading states immediately
        // Resetting loading state before an async fetch is intentional here — the
        // extra render this causes is negligible for a search-as-you-type hook.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResults(prev => ({
            ...prev,
            instantLocations: [],
            detailedLocations: [],
            isInstantLoading: true,
            isDetailedLoading: trimmedQuery.length >= 3,
            detailedError: undefined,
        }));

        // Start both searches in parallel
        const encodedQuery = encodeURIComponent(trimmedQuery);
        fetchInstantResults(encodedQuery, trimmedQuery);

        if (trimmedQuery.length >= 3) {
            fetchDetailedResults(encodedQuery, trimmedQuery);
        }
    }, [trimmedQuery, citiesOnly]);

    return results;
}