import React, { useState, useRef, useEffect } from 'react';
import ListItemText from '@mui/material/ListItemText';
import { LOCATION_TYPE_COUNTRY, LOCATION_TYPE_COUNTRY_DISPLAY, LOCATION_TYPE_PRESET_REGION, LOCATION_TYPE_STATE, LOCATION_TYPE_STATE_DISPLAY, LocationResult } from '@/types/location';
import Typography from '@mui/material/Typography';
import InputWithDebounce from '@/components/ui/InputWithDebounce';

interface LocationAutocompleteProps {
  value: string | null;
  onSelect: (location: LocationResult | null) => void;
}

export default function LocationAutocomplete({ value, onSelect }: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map<string, LocationResult[]>());
  const MAX_CACHE_SIZE = 10;

  // Track last selected value to detect real changes
  const lastFetchedQuery = useRef<string | null>(null);

  useEffect(() => {
    if (value !== null && value !== query) {
      setQuery(value);
    }
  }, [value, query]);

  const fetchSuggestions = async (q: string) => {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed || trimmed === lastFetchedQuery.current) {
      return;
    }
    lastFetchedQuery.current = trimmed;

    console.log("Fetching location suggestions for query:", q);
    setLoading(true);
    const cached = cache.current.get(q);
    if (cached && cached.length > 0) {
      setResults(cached);
      setLoading(false);
      return;
    } else {
      try {
        const res = await fetch(`/api/location-suggestions?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const { matchingRegions, matchingLocations } = await res.json();
          console.debug("Nominatim regions:", matchingRegions);
          console.debug("Nominatim locations:", matchingLocations);
          const fullResults = [...matchingRegions, ...matchingLocations];
          if (cache.current.size >= MAX_CACHE_SIZE) {
            const firstKey = cache.current.keys().next().value;
            if (firstKey !== undefined) {
              cache.current.delete(firstKey);
            }
          }
          cache.current.set(q, fullResults);
          setResults(fullResults);
        } else {
          setResults([]);
        }

      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderResult = (result: LocationResult) => (
    <ListItemText
      primary={
        <Typography
          fontWeight={
            result.type === LOCATION_TYPE_PRESET_REGION ? 'bold' : 'normal'
          }
        >
          {result.display_name}
          {result.type === LOCATION_TYPE_COUNTRY && (
            <Typography
              component="span"
              fontStyle="italic"
              fontWeight="normal"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              {LOCATION_TYPE_COUNTRY_DISPLAY}
            </Typography>
          )}
          {result.type === LOCATION_TYPE_STATE && (
            <Typography
              component="span"
              fontStyle="italic"
              fontWeight="normal"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              {LOCATION_TYPE_STATE_DISPLAY}
            </Typography>
          )}
        </Typography>
      }
    />
  );

  return (
    <InputWithDebounce
      value={query}
      onChange={(val) => {
        setQuery(val);
      }}
      onDebouncedChange={(val) => {
        fetchSuggestions(val);
      }}
      onClear={() => {
        setQuery('');
        setResults([]);
        onSelect(null);
      }}
      placeholder="Search a city, state, or country"
      debounceMs={300}
      isLocationInput={true}
      withDropdown={true}
      loading={loading}
      results={results}
      fetchResults={fetchSuggestions}
      onSelect={onSelect}
      renderResult={renderResult}
    />
  );
}