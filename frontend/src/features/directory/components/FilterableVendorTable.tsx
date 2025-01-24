"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import { SearchBar } from './SearchBar';
import { VendorGrid } from './VendorGrid';
import { Vendor } from '@/types/vendor';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const PAGE_SIZE = 12;

export default function FilterableVendorTable({ vendors }: { vendors: Vendor[] }) {


  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(null);

  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number | null>(
    null,
  );
  const [visibleVendors, setVisibleVendors] = React.useState(vendors.slice(0, PAGE_SIZE)); // Start with the first 20 vendors
  const [loading, setLoading] = React.useState(false);
  const observerRef = React.useRef<HTMLDivElement | null>(null);

  const uniqueRegions: string[] = Array.from(
    new Set(vendors
      .map((vendor) => vendor.region)
      .filter((region): region is string => region !== null && region !== undefined) // Filter out null and undefined
    )
  );

  const getFilteredVendors = () => {
    if (!selectedRegion) return vendors;
    return vendors.filter((vendor) => vendor.region === selectedRegion);
  };

  const loadMoreVendors = () => {
    if (loading) return;
    setLoading(true);

    setTimeout(() => {
      const currentLength = visibleVendors.length;
      const filteredVendors = getFilteredVendors();
      const nextVendors = filteredVendors.slice(
        currentLength,
        currentLength + PAGE_SIZE // Load more vendors
      );

      setVisibleVendors((prevVendors) => [...prevVendors, ...nextVendors]);
      setLoading(false);
    }, 500); // Simulate loading time
  };

  // Intersection Observer to detect scrolling near the end
  React.useEffect(() => {
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
  }, [visibleVendors]);

  React.useEffect(() => {
    const filteredVendors = getFilteredVendors();
    setVisibleVendors(filteredVendors.slice(0, PAGE_SIZE)); // Reset to first PAGE_SIZE of filtered data
  }, [selectedRegion]);



  const handleFocus = (index: number) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          flexDirection: 'row',
          gap: 1,
          width: { xs: '100%', md: 'fit-content' },
          overflow: 'auto',
        }}
      >
        <SearchBar />
        <IconButton size="small" aria-label="RSS feed">
          <RssFeedRoundedIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          width: '100%',
          justifyContent: 'space-between',
          alignItems: { xs: 'start', md: 'center' },
          gap: 4,
          overflow: 'auto',
        }}
      >
        {/* Dropdown filter */}
        <FormControl sx={{ minWidth: 200, marginBottom: 2 }}>
          <Select
            labelId="region-select-label"
            value={selectedRegion || ''}
            onChange={(e) => setSelectedRegion(e.target.value || null)}
            label="Region"
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
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'row',
            gap: 1,
            width: { xs: '100%', md: 'fit-content' },
            overflow: 'auto',
          }}
        >
          <SearchBar />
          <IconButton size="small" aria-label="RSS feed">
            <RssFeedRoundedIcon />
          </IconButton>
        </Box>
      </Box>
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

    </Box >
  );
}