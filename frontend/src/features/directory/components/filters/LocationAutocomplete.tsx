'use client';

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

interface LocationAutocompleteProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onDebouncedChange: (value: string, prev: string) => void;
  selectedLocation: LocationResult | null;
  onSelect: (location: LocationResult | null) => void;
  results: LocationResult[];
  loading: boolean;
  placeholder: string
}

export default function LocationAutocomplete({
  inputValue,
  onInputChange,
  onDebouncedChange,
  selectedLocation,
  onSelect,
  results,
  loading,
  placeholder = "Search for a location..."
}: LocationAutocompleteProps) {
  // Consider it selected only if we have a location and the input exactly matches
  // But also check if input is empty (for clearing behavior)
  const hasSelected = Boolean(
    selectedLocation &&
    inputValue &&
    inputValue.trim() !== '' &&
    inputValue === selectedLocation.display_name
  );

  // Partial deletion: just update the text, leave the active filter alone.
  // Full deletion: clear the filter, same as the X button.
  const handleInputChange = (val: string) => {
    onInputChange(val);
    if (val.trim() === '') {
      onSelect(null);
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
      value={inputValue}
      onChange={handleInputChange}
      onDebouncedChange={onDebouncedChange}
      placeholder={placeholder}
      debounceMs={300}
      isLocationInput={true}
      withDropdown={true}
      loading={loading}
      results={results}
      onSelect={onSelect}
      renderResult={renderResult}
      hasSelected={hasSelected}
    />
  );
}