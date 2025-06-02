import React, { useState, useRef, useMemo, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { debounce } from 'lodash';
import { LOCATION_TYPE_COUNTRY, LOCATION_TYPE_COUNTRY_DISPLAY, LOCATION_TYPE_PRESET_REGION, LOCATION_TYPE_STATE, LOCATION_TYPE_STATE_DISPLAY, LocationResult } from '@/types/location';
import Box from '@mui/system/Box';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

interface LocationAutocompleteProps {
  value: string | null;
  onSelect: (location: LocationResult | null) => void;
}

export default function LocationAutocomplete({ value, onSelect }: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultWasClickedRef = useRef(false);
  const clearWasClickedRef = useRef(false); // Add this ref to track clear button clicks

  useEffect(() => {
    setQuery(value || ""); // Update query when the value prop changes
  }, [value]);

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
        const { matchingRegions, matchingLocations } = await res.json();
        console.log("Nominatim regions:", matchingRegions);
        console.log("Nominatim locations:", matchingLocations);
        setResults([...matchingRegions, ...matchingLocations]);
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
    debouncedFetch(value);
  };

  const handleClear = () => {
    clearWasClickedRef.current = true; // Set flag before clearing
    setQuery("");
    setResults([]);
    setDropdownVisible(false);
    onSelect(null); // Notify parent that the location has been cleared
  };

  const handleBlur = () => {
    // Delay to allow click events on dropdown to register
    setTimeout(() => {
      // Don't auto-select if clear button was clicked or if a result was clicked
      if (results.length >= 3 && !resultWasClickedRef.current && !clearWasClickedRef.current) {
        const topResult = results[0];
        setQuery(topResult.display_name); // Set the input box to top result
        onSelect(topResult);
      }
      setDropdownVisible(false);         // Hide dropdown either way
      resultWasClickedRef.current = false; // Reset for next time
      clearWasClickedRef.current = false;  // Reset clear flag
    }, 100);
  };

  const handleFocus = async () => {
    // Fetch suggestions only if the query is not empty
    await fetchSuggestions(query);

    setDropdownVisible(true); // Show the dropdown
  };

  return (
    <Box ref={containerRef} sx={{ position: "relative", maxWidth: 400 }}>
      <TextField
        label="Location"
        variant="outlined"
        fullWidth
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
        slotProps={{
          input: {
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton onClick={handleClear} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {isDropdownVisible && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            width: "100%",
            maxHeight: 200,
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
                      console.log("Selected result:", result);
                      resultWasClickedRef.current = true; // Set flag when result is clicked
                      setQuery(result.display_name); // update input box
                      setDropdownVisible(false);   // close dropdown
                      onSelect(result);              // pass selected result
                    }}
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                  >
                    <ListItemText
                      primary={
                        <Typography
                          fontWeight={result.type === LOCATION_TYPE_PRESET_REGION ? "bold" : "normal"}
                        >
                          {result.display_name}
                          {result.type === LOCATION_TYPE_COUNTRY && (
                            <Typography
                              component="span"
                              fontStyle="italic"
                              fontWeight="normal"
                              color="text.secondary"
                              sx={{ ml: 1 }} // Add some margin for spacing
                            >
                              {LOCATION_TYPE_COUNTRY_DISPLAY}
                            </Typography>
                          )}
                          {result.type === LOCATION_TYPE_STATE && (
                            <Typography
                              component="span"
                              fontStyle="italic"
                              fontWeight="normal"
                              color="text.secondary"
                              sx={{ ml: 1 }} // Add some margin for spacing
                            >
                              {LOCATION_TYPE_STATE_DISPLAY}
                            </Typography>
                          )}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : loading ? (
            <Box sx={{ p: 1 }} alignContent={"center"}>
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