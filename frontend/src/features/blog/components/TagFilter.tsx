'use client';

import { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
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
  expanded: boolean;
}

const ALL_VALUE = '__all__';

export function TagFilter({
  filterGroups,
  activeFilters,
  onChange,
  searchQuery,
  onSearchChange,
  expanded,
}: TagFilterProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) {
      // Small delay so the collapse animation reveals the field before focus
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  const handleSelectChange = (key: string) => (e: SelectChangeEvent) => {
    onChange(key, e.target.value === ALL_VALUE ? null : e.target.value);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            inputRef={inputRef}
            size="small"
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
            fullWidth
          />

          {filterGroups.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {filterGroups.map((group) => (
                <FormControl key={group.key} size="small" sx={{ minWidth: 160 }}>
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
        </Box>
      </Collapse>
    </Box>
  );
}
