"use client"
import React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

// Define interfaces for our data structures
export interface RegionOption {
  unique_region: string;
  inputValue?: string;
}

interface RegionSelectorProps {
  value: RegionOption | null;
  onChange: (value: RegionOption | null) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ value, onChange }) => {
  const filter = createFilterOptions<RegionOption>();

  // List of predefined regions
  const regions: RegionOption[] = [
    { unique_region: "Midwest" },
    { unique_region: "Austin" },
    { unique_region: "Singapore" },
    { unique_region: "Southern California" },
    { unique_region: "Delaware Valley" },
    { unique_region: "DFW (Dallas Fort Worth)" },
    { unique_region: "Australia" },
    { unique_region: "Calgary" },
    { unique_region: "Pacific Northwest" },
    { unique_region: "New York" },
    { unique_region: "Hawaii" },
    { unique_region: "United Kingdom" },
    { unique_region: "GTA (Greater Toronto Area)" },
    { unique_region: "Canada" },
    { unique_region: "Boston" },
    { unique_region: "DMV (DC MD VA)" },
    { unique_region: "Florida" },
    { unique_region: "Pennsylvania" },
    { unique_region: "Las Vegas" },
    { unique_region: "Chicago" },
    { unique_region: "NY Metropolitan (NY NJ CT)" },
    { unique_region: "Houston" },
    { unique_region: "San Francisco/Bay Area" },
    { unique_region: "France" },
    { unique_region: "Hong Kong" },
    { unique_region: "Philippines" },
    { unique_region: "New Jersey" },
    { unique_region: "Spain" },
    { unique_region: "Southern US" },
    { unique_region: "North Carolina" },
    { unique_region: "New England" },
    { unique_region: "Europe" },
    { unique_region: "Utah" },
    { unique_region: "Texas" }
  ];

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: string | RegionOption | null
  ) => {
    // Handle the case where user enters a new region
    if (typeof value === 'string') {
      onChange({ unique_region: value });
      return;
    }
    if (value && value.inputValue) {
      // Create a new region option from the user input
      onChange({ unique_region: value.inputValue });
      return;
    }

    onChange(value);
  };

  return (
    <Autocomplete<RegionOption, false, false, true>
      value={value}
      onChange={handleChange}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        const isExisting = options.some(
          (option) => inputValue === option.unique_region
        );

        if (inputValue !== '' && !isExisting) {
          filtered.push({
            inputValue,
            unique_region: `Add "${inputValue}"`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={regions}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Regular option
        return option.unique_region || '';
      }}
      renderOption={(props, option) => <li {...props} key={option.unique_region}>{option.unique_region}</li>}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label="Region" fullWidth />
      )}
    />
  );
};

export default RegionSelector;
