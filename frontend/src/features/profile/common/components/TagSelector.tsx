"use client"
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { VendorTag } from '@/types/vendor';

interface TagSelectorProps {
  value: VendorTag[] | null;
  onChange: (value: VendorTag[] | null) => void;
  options: VendorTag[];
}

const TagSelector: React.FC<TagSelectorProps> = ({ value, onChange, options }) => {
  const filter = createFilterOptions<VendorTag>();

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: VendorTag[] | null
  ) => {
    // If user clears all tags, pass null instead of empty array
    onChange(newValue && newValue.length > 0 ? newValue : null);
  };

  return (
    <Autocomplete<VendorTag, true, false, false>
      value={value ?? []}
      onChange={handleChange}
      filterOptions={(opts, params) => {
        const filtered = filter(opts, params);
        // Exclude already-selected options
        return filtered.filter(
          (opt) => !(value ?? []).some((v) => v.id === opt.id)
        );
      }}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      multiple
      disableCloseOnSelect
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={options}
      getOptionLabel={(option) => option.display_name ?? option.name ?? ''}
      renderOption={(props, option) => <li {...props} key={option.id}>{option.display_name ?? option.name}</li>}
      renderInput={(params) => (
        <TextField {...params} fullWidth />
      )}
    />
  );
};

export default TagSelector;
