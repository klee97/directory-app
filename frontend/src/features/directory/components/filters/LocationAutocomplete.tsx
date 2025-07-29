'use client';

import React, { useState, useMemo, useEffect } from 'react';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import {
  LOCATION_TYPE_COUNTRY,
  LOCATION_TYPE_COUNTRY_DISPLAY,
  LOCATION_TYPE_PRESET_REGION,
  LOCATION_TYPE_STATE,
  LOCATION_TYPE_STATE_DISPLAY,
  LocationResult,
} from '@/types/location';
import InputWithDebounce from '@/components/ui/InputWithDebounce';
import { useSearch } from '@/features/directory/api/useSearch';

interface LocationAutocompleteProps {
  value: LocationResult | null;
  onSelect: (location: LocationResult | null) => void;
}

export default function LocationAutocomplete({ value, onSelect }: LocationAutocompleteProps) {
  const [inputQuery, setInputQuery] = useState(value?.display_name || '');
  const [searchQuery, setSearchQuery] = useState(value?.display_name || '');

  const {
    instantLocations,
    detailedLocations,
    isInstantLoading,
    isDetailedLoading,
  } = useSearch(searchQuery); // only updates on debounce

  const combinedResults = useMemo(() => {
    console.debug('Combining results:', {
      instantCount: instantLocations.length,
      detailedCount: detailedLocations.length,
    });
    const ids = new Set(instantLocations.map((r) => r.display_name));
    return [...instantLocations, ...detailedLocations.filter((r) => !ids.has(r.display_name))];
  }, [instantLocations, detailedLocations]);

useEffect(() => {
  const displayName = value?.display_name || '';
  if (displayName !== inputQuery) {
    setInputQuery(displayName);
    setSearchQuery(displayName);
  }
}, [value, inputQuery]);

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
      value={inputQuery}
      onChange={setInputQuery}
      onDebouncedChange={(val) => {
        setSearchQuery(val); // triggers useSearch
      }}
      onClear={() => {
        setInputQuery('');
        setSearchQuery('');
        onSelect(null);
      }}
      placeholder="Search a city, state, or country"
      debounceMs={300}
      isLocationInput={true}
      withDropdown={true}
      loading={(isInstantLoading || isDetailedLoading)}
      results={combinedResults}
      onSelect={(result) => {
        if (result) setInputQuery(result.display_name);
        onSelect(result);
      }}
      renderResult={renderResult}
    />
  );
}