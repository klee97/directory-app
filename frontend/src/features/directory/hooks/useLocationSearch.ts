import { useState, useEffect, useRef } from 'react';
import { fetchApi } from '@/lib/api/client';
import { LocationResult } from '@/types/location';
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
    const [results, setResults] = useState<SearchResults>({
        instantLocations: [],
        detailedLocations: [],
        isInstantLoading: false,
        isDetailedLoading: false,
        detailedSuccess: false,
    });

    // Use ref to track the current query to prevent race conditions
    const currentQueryRef = useRef<string>('');

    useEffect(() => {
        const trimmedQuery = query.trim();
        currentQueryRef.current = trimmedQuery;

        if (!trimmedQuery) {
            setResults({ ...defaultEmptyResults });
            return;
        }

        const fetchInstantResults = async (encodedQuery: string, originalQuery: string) => {
            console.debug('Fetching instant results for encoded query:', encodedQuery);

            try {
                const response = await fetchApi<{ locations: LocationResult[]; query: string; cached: boolean }>(`/api/search/instant?${QUERY_PARAM}=${encodedQuery}${citiesOnly ? `&${CITIES_ONLY_PARAM}=true` : ''}`);

                // Only update if this is still the current query
                if (currentQueryRef.current === originalQuery) {
                    setResults(prev => ({
                        ...prev,
                        instantLocations: response.ok ? response.data.locations : [],
                        isInstantLoading: false,
                    }));
                }
            } catch (error) {
                console.error('Instant search failed:', error);
                if (currentQueryRef.current === originalQuery) {
                    setResults(prev => ({
                        ...prev,
                        instantLocations: [],
                        isInstantLoading: false
                    }));
                }
            }
        };

        const fetchDetailedResults = async (encodedQuery: string, originalQuery: string) => {
            console.debug('Fetching detailed results for query:', encodedQuery);

            try {
                const response = await fetchApi<{ locations: LocationResult[]; query: string; success: boolean; error?: string; cached: boolean }>(`/api/search/detailed?${QUERY_PARAM}=${encodedQuery}${citiesOnly ? `&${CITIES_ONLY_PARAM}=true` : ''}`);

                // Only update if this is still the current query
                if (currentQueryRef.current === originalQuery) {
                    setResults(prev => ({
                        ...prev,
                        detailedLocations: response.ok ? response.data.locations : [],
                        detailedSuccess: response.ok ? response.data.success : false,
                        detailedError: response.ok ? response.data.error : response.error,
                        isDetailedLoading: false,
                    }));
                }
            } catch (error) {
                console.error('Detailed search failed:', error);
                if (currentQueryRef.current === originalQuery) {
                    setResults(prev => ({
                        ...prev,
                        detailedLocations: [],
                        detailedSuccess: false,
                        detailedError: error instanceof Error ? error.message : String(error),
                        isDetailedLoading: false,
                    }));
                }
            }
        };

        // Clear previous results and set loading states immediately
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
    }, [query, citiesOnly]);

    return results;
}