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
  const abortControllerRef = useRef<AbortController | null>(null);
  const clearWasClickedRef = useRef(false); // Add this ref to track clear button clicks

  useEffect(() => {
    setQuery(value || ""); // Update query when the value prop changes
  }, [value]);

  const fetchSuggestions = async (q: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    try {
      const res = await fetch(`/api/location-suggestions?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const { matchingRegions, matchingLocations } = await res.json();
        console.log("Nominatim regions:", matchingRegions);
        console.log("Nominatim locations:", matchingLocations);
        setResults([...matchingRegions, ...matchingLocations]);
      } else {
        setResults([]);
      }

    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
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
        clearWasClickedRef.current = true;
        setQuery('');
        setResults([]);
        onSelect(null);
      }}
      placeholder="Location"
      debounceMs={300}
      isLocationInput={true}
      withDropdown={true}
      loading={loading}
      results={results}
      onSelect={onSelect}
      renderResult={renderResult}
    />
  );
}