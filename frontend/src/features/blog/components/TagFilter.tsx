'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import type { FilterGroup } from './ArticleTable';
import { formatLabel } from './postLabels';

export type ActiveFilters = Record<string, string | null>;

interface TagFilterProps {
  filterGroups: FilterGroup[];
  activeFilters: ActiveFilters;
  onChange: (key: string, value: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isFiltering: boolean;
  onClear: () => void;
}

const ALL_VALUE = '__all__';

export function TagFilter({
  filterGroups,
  activeFilters,
  onChange,
  searchQuery,
  onSearchChange,
  isFiltering,
  onClear,
}: TagFilterProps) {
  const handleSelectChange = (key: string) => (e: SelectChangeEvent) => {
    onChange(key, e.target.value === ALL_VALUE ? null : e.target.value);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4, alignItems: 'center' }}>
      {filterGroups.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', flex: { xs: '1 1 100%', md: 'none' } }}>
          {filterGroups.map((group) => (
            <FormControl key={group.key} size="small" sx={{ minWidth: { xs: 0, md: 160 }, flex: { xs: 1, md: 'none' } }}>
              <InputLabel id={`filter-${group.key}-label`}>{group.label}</InputLabel>
              <Select
                labelId={`filter-${group.key}-label`}
                value={activeFilters[group.key] ?? ALL_VALUE}
                label={group.label}
                onChange={handleSelectChange(group.key)}
              >
                <MenuItem value={ALL_VALUE}>All</MenuItem>
                {group.options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {formatLabel(option)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Box>
      )}
      <TextField
        size="small"
        aria-label="Search blog posts"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          flexGrow: 1,
          minWidth: { xs: '100%', md: 200 },
          order: { xs: -1, md: 0 },
        }}
      />
      {isFiltering && (
        <Box sx={{ flexBasis: '100%' }}>
          <Button size="small" onClick={onClear}>
            Clear all
          </Button>
        </Box>
      )}
    </Box>
  );
}
