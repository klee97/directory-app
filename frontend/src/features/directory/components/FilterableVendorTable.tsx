"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  CircularProgress,
} from '@mui/material';
import { VendorGrid } from './VendorGrid';
import { SearchBar } from './SearchBar';
import { Vendor } from '@/types/vendor';
import { searchVendors } from '../api/searchVendors';

const PAGE_SIZE = 12;

export default function FilterableVendorTable({ uniqueRegions, vendors, searchQuery }: { uniqueRegions: string[], vendors: Vendor[], searchQuery: string }) {
  const [travelsWorldwide, setTravelsWorldwide] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);
  const [visibleVendors, setVisibleVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Memoize the filtered vendors based on the selected filters
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesRegion = selectedRegion ? vendor.region === selectedRegion : true;
      const matchesTravel = travelsWorldwide ? vendor.travels_world_wide === 'Yes' : true;
      return matchesRegion && matchesTravel;
    });
  }, [vendors, selectedRegion, travelsWorldwide]);

  const searchedVendors = useMemo(() => searchVendors(searchQuery, filteredVendors), [searchQuery, filteredVendors]);

  // Load more vendors when scrolling
  const loadMoreVendors = () => {
    if (loading) return;
    setLoading(true);

    const currentLength = visibleVendors.length;
    const nextVendors = searchedVendors.slice(currentLength, currentLength + PAGE_SIZE);

    setVisibleVendors((prevVendors) => [...prevVendors, ...nextVendors]);
    setLoading(false);
  };

  // Reset visible vendors whenever the filtered & searched vendor list changes
  useEffect(() => {
    setVisibleVendors(searchedVendors.slice(0, PAGE_SIZE));
  }, [searchedVendors]);

  // Intersection Observer to detect scrolling near the end
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreVendors();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [searchedVendors]);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTravelsWorldwide(event.target.checked);
  };

  const handleFocus = (index: number) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Filters Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {/* Region Filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={selectedRegion || ''}
            onChange={(e) => setSelectedRegion(e.target.value || null)}
            displayEmpty
          >
            <MenuItem value="">
              <em>All Regions</em>
            </MenuItem>
            {uniqueRegions.map((region) => (
              <MenuItem key={region} value={region}>
                {region}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Travels Worldwide Filter */}
        <FormControlLabel
          control={
            <Switch
              checked={travelsWorldwide}
              onChange={handleSwitchChange}
              color="primary"
            />
          }
          label="Travels Worldwide"
        />
        <SearchBar />
      </Box>

      {/* Filtered Vendors Count */}
      <Typography variant="h6">
        {searchedVendors.length} artist{searchedVendors.length === 1 ? '' : 's'} matched
      </Typography>

      {/* Vendor Grid */}
      <VendorGrid
        handleFocus={handleFocus}
        handleBlur={handleBlur}
        focusedCardIndex={focusedCardIndex}
        vendors={visibleVendors}
      />

      {/* Loading Spinner */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Intersection observer target */}
      <div ref={observerRef} style={{ height: 1 }} />
    </Box>
  );
}
