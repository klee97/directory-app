"use client"
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

// Define interfaces for our data structures
export interface TagOption {
  unique_tag: string;
  id: string;
}

interface TagSelectorProps {
  value: TagOption | null;
  onChange: (value: TagOption | null) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ value }) => {
  const filter = createFilterOptions<TagOption>();

  // List of predefined tags
  const tags: TagOption[] = [
    { unique_tag: "SPECIALTY_HAIR", id: "432fa3e3-9007-4df0-8a5c-dd1d5491194a" },
    { unique_tag: "SPECIALTY_MAKEUP", id: "846350cd-e203-449f-90d0-c112aed74d0b" },
    { unique_tag: "SKILL_SOUTH_ASIAN", id: "90944527-f735-461c-92cf-79395c93c371" },
  ];

  return (
    <Autocomplete<TagOption, false, false, true>
      value={value}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={tags}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Regular option
        return option.unique_tag || '';
      }}
      renderOption={(props, option) => <li {...props} key={option.unique_tag}>{option.unique_tag}</li>}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label="Tags" fullWidth />
      )}
    />
  );
};

export default TagSelector;
