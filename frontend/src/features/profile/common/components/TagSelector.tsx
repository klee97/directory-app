"use client"
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { VendorTag } from '@/types/vendor';

interface TagSelectorProps {
    value: VendorTag[];
    onChange: (value: VendorTag[]) => void;
    options: VendorTag[];
}

const TagSelector: React.FC<TagSelectorProps> = ({ value, onChange, options }) => {
    const filter = createFilterOptions<VendorTag>();

    const handleChange = (
        event: React.SyntheticEvent<Element, Event>,
        value: VendorTag[] | null
    ) => {
        onChange(value ?? []);
    };

    return (
        <Autocomplete<VendorTag, true, false, false>
            value={value}
            onChange={handleChange}
            filterOptions={(opts, params) => filter(opts, params)}
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
