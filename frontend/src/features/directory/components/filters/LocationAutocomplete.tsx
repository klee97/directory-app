import React, { useState, useRef, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { debounce } from 'lodash';
import { LocationResult } from '@/types/location';
import Box from '@mui/system/Box';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

interface LocationAutocompleteProps {
  onSelect: (location: LocationResult) => void;
}

export default function LocationAutocomplete({ onSelect }: LocationAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultWasClickedRef = useRef(false);

  const fetchSuggestions = async (q: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch(`/api/location-suggestions?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Nominatim results:", data);
        setResults(data);
      } else {
        setResults([]);
      }
      setDropdownVisible(true);

    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useMemo(() => debounce(fetchSuggestions, 300), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 2) {
      debouncedFetch(value);
    } else {
      setResults([]);
    }
  };

  const handleBlur = () => {
    // Delay to allow click events on dropdown to register
    setTimeout(() => {
      if (results.length >= 3 && !resultWasClickedRef.current) {
        const topResult = results[0];
        setQuery(topResult.display_name); // Set the input box to best guess
        onSelect(topResult);              // Notify parent
      }
      setDropdownVisible(false);         // Hide dropdown either way
      resultWasClickedRef.current = false; // Reset for next time
    }, 100);
  };

  return (
    <Box ref={containerRef} sx={{ position: "relative", maxWidth: 400 }}>
      <TextField
        label="Enter a city or location"
        variant="outlined"
        fullWidth
        value={query}
        onChange={handleInputChange}
        onFocus={() => query.length >= 3 && setDropdownVisible(true)}
        onBlur={handleBlur}
        autoComplete="off"
      />

      {isDropdownVisible && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            width: "100%",
            maxHeight: 240,
            overflowY: "auto",
            zIndex: (theme) => theme.zIndex.modal,
            mt: 0.5,
          }}
        >
          {results.length > 0 ? (
            <List dense disablePadding>
              {results.map((result, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setQuery(result.display_name); // update input box
                      setDropdownVisible(false);   // close dropdown
                      onSelect(result);              // pass selected result
                    }}
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                  >
                    <ListItemText
                      primary={result.display_name}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : loading ? (
            <Box sx={{ p: 1 }}>
              <CircularProgress size={20} />
            </Box>
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
  );
}