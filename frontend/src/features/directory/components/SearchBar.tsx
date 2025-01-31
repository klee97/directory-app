"use client"
import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import IconButton from '@mui/material/IconButton';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { ReadonlyURLSearchParams, usePathname, useRouter } from 'next/navigation';
import { SEARCH_PARAM } from '@/lib/constants';

export function SearchBar({ searchParams }: { searchParams: ReadonlyURLSearchParams }) {
  const pathname = usePathname();
  const { replace } = useRouter();
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get(SEARCH_PARAM) || '');

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set(SEARCH_PARAM, term);
    } else {
      params.delete(SEARCH_PARAM);
    }
    replace(`${pathname}?${params.toString()}`);
    console.log(term);
  }

  function handleClear() {
    setSearchTerm(''); // Clear the search input
    handleSearch(''); // Remove the query parameter
  }

  return (
    <FormControl sx={{ width: { xs: '100%', md: '25ch' } }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Search artists…"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          handleSearch(e.target.value);
        }}
        sx={{ flexGrow: 1 }}
        startAdornment={
          <InputAdornment position="start" sx={{ color: 'text.primary' }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        endAdornment={
          searchTerm && (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={handleClear}
                edge="end"
                size="small"
              >
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }
        inputProps={{
          'aria-label': 'search',
        }}
      />
    </FormControl>
  );
}
