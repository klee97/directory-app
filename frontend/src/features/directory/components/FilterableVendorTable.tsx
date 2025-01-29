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
  const [sortOption, setSortOption] = useState<string>('default'); // Added state for sorting

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

  // Apply search and sorting
  const searchedAndSortedVendors = useMemo(() => {
    const result = searchVendors(searchQuery, filteredVendors);

    // if (sortOption === 'priceLowToHigh') {
    //   result.sort((a, b) => {
    //     if (a['bridal_hair_&_makeup_price'] === null) return 1; // Null prices go to the end
    //     if (b['bridal_hair_&_makeup_price'] === null) return -1;
    //     console.log("Comparing prices");
    //     return a['bridal_hair_&_makeup_price'] - b['bridal_hair_&_makeup_price'];
    //   });
    // } else if (sortOption === 'priceHighToLow') {
    //   result.sort((a, b) => {
    //     if (a['bridal_hair_&_makeup_price'] === null) return 1; // Null prices go to the end
    //     if (b['bridal_hair_&_makeup_price'] === null) return -1;
    //     return b['bridal_hair_&_makeup_price'] - a['bridal_hair_&_makeup_price'];
    //   });
    // }

    return result;
  }, [searchQuery, filteredVendors, sortOption]);

  // Load more vendors when scrolling
  const loadMoreVendors = () => {
    if (loading) return;
    setLoading(true);

    setTimeout(() => {
      const currentLength = visibleVendors.length;
      const nextVendors = searchedAndSortedVendors.slice(currentLength, currentLength + PAGE_SIZE);
  
      setVisibleVendors((prevVendors) => [...prevVendors, ...nextVendors]);
      setLoading(false);
    }, 500); // Simulate loading time
  };
  

  // Reset visible vendors whenever the filtered & searched vendor list changes
  useEffect(() => {
    setVisibleVendors(searchedAndSortedVendors.slice(0, PAGE_SIZE));
  }, [searchedAndSortedVendors]);

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
  }, [searchedAndSortedVendors]);

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
      {/* Filters and Sorting Section */}
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

        {/* Sorting Section */}
        <FormControl sx={{ minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>
            Sort By
          </Typography>
          <Select
            value={sortOption || 'default'}
            onChange={(e) => setSortOption(e.target.value)}
            displayEmpty
          >
            <MenuItem value="default">
              <em>Default</em>
            </MenuItem>
            <MenuItem value="priceLowToHigh">Price: Low to High</MenuItem>
            <MenuItem value="priceHighToLow">Price: High to Low</MenuItem>
          </Select>
        </FormControl>

        {/* Search */}
        <SearchBar />
      </Box>

      {/* Filtered Vendors Count */}
      <Typography variant="h6">
        {searchedAndSortedVendors.length} artist{searchedAndSortedVendors.length === 1 ? '' : 's'} matched
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
