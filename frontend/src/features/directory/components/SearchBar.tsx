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

  const searchParamValue = searchParams.get(SEARCH_PARAM) || '';
  const [inputValue, setInputValue] = useState(searchParamValue);
  const [debouncedValue, setDebouncedValue] = useState(searchParamValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep input value in sync with URL only if user isn't actively typing
  useEffect(() => {
    if (searchParamValue !== debouncedValue) {
      setInputValue(searchParamValue);
      setDebouncedValue(searchParamValue);
    }
  }, [searchParamValue]);

  // Debounce the search term
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedValue(inputValue); // Commit the debounced value

      const previousTerm = searchParams.get(SEARCH_PARAM) || '';
      const params = new URLSearchParams(searchParams);
      if (inputValue) {
        params.set(SEARCH_PARAM, inputValue);
      } else {
        params.delete(SEARCH_PARAM);
      }
      replace(`${pathname}?${params.toString()}`, { scroll: false });

      if (inputValue !== previousTerm) {
        trackSearchQuery(inputValue, previousTerm, resultCount);
      }

      debounceTimerRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue]);

  function handleInputChange(term: string) {
    setInputValue(term); // Update the input field immediately
  }

  function handleClear() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const previousTerm = inputValue;
    setInputValue('');
    setDebouncedValue('');

    const params = new URLSearchParams(searchParams);
    params.delete(SEARCH_PARAM);
    replace(`${pathname}?${params.toString()}`, { scroll: false });

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
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        sx={{ flexGrow: 1 }}
        startAdornment={
          <InputAdornment position="start" sx={{ color: 'text.primary' }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        endAdornment={
          inputValue && (
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
