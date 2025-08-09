import { useState, useEffect, useRef } from 'react';
import { LocationResult } from '@/types/location';

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

export function useSearch(query: string): SearchResults {
    const [results, setResults] = useState<SearchResults>({
        instantLocations: [],
        detailedLocations: [],
        isInstantLoading: false,
        isDetailedLoading: false,
        detailedSuccess: false,
    });

    // Use ref to track the current query to prevent race conditions
    const currentQueryRef = useRef<string>('');

    const fetchInstantResults = async (encodedQuery: string, originalQuery: string) => {
        console.debug('Fetching instant results for encoded query:', encodedQuery);

        try {
            const response = await fetch(`/api/search/instant?q=${encodedQuery}`);
            const data = await response.json();

            // Only update if this is still the current query
            if (currentQueryRef.current === originalQuery) {
                setResults(prev => ({
                    ...prev,
                    instantLocations: data.locations || [],
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
            const response = await fetch(`/api/search/detailed?q=${encodedQuery}`);
            const data = await response.json();

            // Only update if this is still the current query
            if (currentQueryRef.current === originalQuery) {
                setResults(prev => ({
                    ...prev,
                    detailedLocations: data.locations || [],
                    detailedSuccess: data.success || false,
                    detailedError: data.error,
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

    useEffect(() => {
        const trimmedQuery = query.trim();
        currentQueryRef.current = trimmedQuery;

        if (!trimmedQuery) {
            setResults({ ...defaultEmptyResults });
            return;
        }

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
    }, [query]);

    return results;
}