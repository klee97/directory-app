'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LocationOnIconOutlined from '@mui/icons-material/LocationOnOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearIcon from '@mui/icons-material/Clear';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { useEffect, useRef, useState } from 'react';

interface InputWithDebounceProps {
  value: string;
  onChange: (val: string) => void;
  onDebouncedChange?: (val: string, prev: string) => void;
  placeholder?: string;
  debounceMs?: number;
  onClear?: () => void;
  isLocationInput?: boolean;
  withDropdown?: boolean;
  loading?: boolean;
  results?: Array<{ display_name: string, type?: string | undefined }>;
  onSelect?: (result: { display_name: string, type?: string | undefined }) => void;
  renderResult?: (result: { display_name: string, type?: string | undefined }) => React.ReactNode;
}

export default function InputWithDebounce({
  value,
  onChange,
  onDebouncedChange,
  placeholder,
  debounceMs = 300,
  onClear,
  isLocationInput = false,
  withDropdown = false,
  loading = false,
  results = [],
  onSelect,
  renderResult,
}: InputWithDebounceProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const prevValueRef = useRef(value);
  const resultWasClickedRef = useRef(false);
  const clearWasClickedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Sync from parent value only when not typing
    if (!isTypingRef.current && value !== inputValue) {
      setInputValue(value);
    }
  }, [value, inputValue]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;

      if (onDebouncedChange && inputValue !== prevValueRef.current) {
        onDebouncedChange(inputValue, prevValueRef.current);
        prevValueRef.current = inputValue;
      }

      debounceTimerRef.current = null;
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, debounceMs, onDebouncedChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isTypingRef.current = true;
    setDropdownVisible(true);
    setHasSelected(false); // user is typing again, so reset selection
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    isTypingRef.current = false;
    setInputValue('');
    onChange('');
    if (onDebouncedChange) onDebouncedChange('', prevValueRef.current);
    prevValueRef.current = '';
    onClear?.();
    clearWasClickedRef.current = true;
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (withDropdown && results.length && !resultWasClickedRef.current && !clearWasClickedRef.current) {
        onSelect?.({ ...results[0], type: results[0].type || '' });
        setInputValue(results[0]?.display_name || '');
      }
      setDropdownVisible(false);
      resultWasClickedRef.current = false;
      clearWasClickedRef.current = false;
    }, 100);
  };

  const handleFocus = () => {
    if (withDropdown && !hasSelected && results.length) {
      setDropdownVisible(true);
    }
  };


  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      <FormControl fullWidth variant="outlined">
        <OutlinedInput
          size="small"
          inputRef={inputRef}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          startAdornment={
            <InputAdornment position="start">
              {isLocationInput ? (
                <LocationOnIconOutlined fontSize="small" />
              ) : (
                <SearchRoundedIcon fontSize="small" />
              )}
            </InputAdornment>
          }
          endAdornment={
            inputValue && (
              <InputAdornment position="end">
                <IconButton aria-label="clear input" onClick={handleClear} edge="end" size="small">
                  {withDropdown ? <ClearIcon /> : <ClearRoundedIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            )
          }
        />
      </FormControl>

      {withDropdown && isDropdownVisible && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            width: '100%',
            maxHeight: 200,
            overflowY: 'auto',
            zIndex: (theme) => theme.zIndex.modal,
            mt: 0.5,
          }}
        >
          {loading ? (
            <Box sx={{ p: 1 }} alignContent={'center'}>
              <CircularProgress size={20} />
            </Box>
          ) : results.length > 0 ? (
            <List dense disablePadding>
              {results.map((result, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      resultWasClickedRef.current = true;
                      setInputValue(result.display_name);
                      setHasSelected(true);
                      setDropdownVisible(false);
                      onSelect?.({ ...result, type: result.type || '' });
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {renderResult ? (
                      renderResult(result)
                    ) : (
                      <ListItemText primary={result.display_name} />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                No results found
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  )
}
