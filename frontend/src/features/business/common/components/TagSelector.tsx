"use client"
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { tagsOptionsMap } from '@/types/tag';

// Define interfaces for our data structures
export interface TagOption {
    unique_tag: string;
    id: string;
}

interface TagSelectorProps {
    value: TagOption[];
    onChange: (value: TagOption[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ value, onChange }) => {
    const filter = createFilterOptions<TagOption>();

    // List of predefined tags
    const tags: TagOption[] = [...tagsOptionsMap.values()]

    const handleChange = (
        event: React.SyntheticEvent<Element, Event>,
        value: (string | TagOption)[] | null
    ) => {
        if (value === null) {
            onChange([]);
            return;
        }

        const finalOptions = value.map((option) => {
            if (typeof option === 'string') {
                return tagsOptionsMap.get(option)
            }
            return option;
        }).filter((option) => 
            option !== null && option !== undefined
        )

        onChange(finalOptions);
    };

    return (
        <Autocomplete<TagOption, true, false, true>
            value={value}
            onChange={handleChange}
            filterOptions={(options, params) => {
                const filtered = filter(options, params);

                return filtered;
            }}
            multiple
            disableCloseOnSelect
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
