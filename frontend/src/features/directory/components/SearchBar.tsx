"use client"
import { useEffect, useRef, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import IconButton from '@mui/material/IconButton';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { ReadonlyURLSearchParams, usePathname, useRouter } from 'next/navigation';
import { SEARCH_PARAM } from '@/lib/constants';
import { trackSearchQuery } from '@/utils/analytics/trackFilterEvents';

const DEBOUNCE_MS = 500; // Debounce delay in milliseconds

export function SearchBar({ searchParams, resultCount }: { searchParams: ReadonlyURLSearchParams, resultCount?: number }) {
  const pathname = usePathname();
  const { replace } = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchParams.get(SEARCH_PARAM) || '');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep the input in sync with URL params if they change externally
  useEffect(() => {
    const paramSearchTerm = searchParams.get(SEARCH_PARAM) || '';
    if (paramSearchTerm !== searchTerm) {
      setSearchTerm(paramSearchTerm);
    }
  }, [searchParams, resultCount, searchTerm]);

  function handleSearch(term: string) {
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Update local state immediately for responsive UI
    setSearchTerm(term);

    // Debounce the URL update and tracking
    debounceTimerRef.current = setTimeout(() => {
      const previousTerm = searchParams.get(SEARCH_PARAM) || '';
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set(SEARCH_PARAM, term);
      } else {
        params.delete(SEARCH_PARAM);
      }
      replace(`${pathname}?${params.toString()}`);
      // Only track when the search term actually changes
      if (term !== previousTerm) {
        // Track with our specialized search tracking
        trackSearchQuery(term, previousTerm, resultCount);
      }
      console.debug(term);
      debounceTimerRef.current = null;
    }, DEBOUNCE_MS);
  }

  function handleClear() {
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const previousTerm = searchTerm;
    setSearchTerm(''); // Clear the search input
    // Update URL immediately on clear instead of using handleSearch with debounce
    const params = new URLSearchParams(searchParams);
    params.delete(SEARCH_PARAM);
    replace(`${pathname}?${params.toString()}`);

    // Track the clearing action for search
    if (previousTerm) {
      trackSearchQuery('', previousTerm);
    }
  }

  return (
    <FormControl sx={{ width: { xs: '100%', md: '40ch' } }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Search locations or artists…"
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
