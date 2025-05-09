"use client"
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { VendorGrid } from './VendorGrid';
import { SearchBar } from './SearchBar';
import { Vendor, VendorId } from '@/types/vendor';
import { searchVendors } from '../api/searchVendors';
import { LocationFilter } from './LocationFilter';
import TravelFilter from './TravelFilter';
import { SkillFilter } from './SkillFilter';
import { useRouter, useSearchParams } from 'next/navigation';
import { LOCATION_PARAM, SEARCH_PARAM, SKILL_PARAM, TRAVEL_PARAM } from '@/lib/constants';
import { Suspense } from 'react';
import useScrollRestoration from '@/hooks/useScrollRestoration';

const PAGE_SIZE = 12;

function FilterableVendorTableContent({ uniqueRegions, tags, vendors, favoriteVendorIds }: {
  uniqueRegions: string[],
  tags: string[],
  vendors: Vendor[],
  favoriteVendorIds: VendorId[]
}) {
  const searchParams = useSearchParams();
  const selectedRegion = searchParams.get(LOCATION_PARAM) || "";
  const searchQuery = searchParams.get(SEARCH_PARAM) || "";
  const travelsWorldwide = searchParams.get(TRAVEL_PARAM) === "true";
  const selectedSkill = searchParams.get(SKILL_PARAM) || "";

  const [sortOption, setSortOption] = useState<string>('default'); // Added state for sorting
  const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);
  const [visibleVendors, setVisibleVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useScrollRestoration(true);

  // Memoize the filtered vendors based on the selected filters
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesRegion = selectedRegion ? vendor.metro_region === selectedRegion : true;
      const matchesTravel = travelsWorldwide ? vendor.travels_world_wide : true;
      const matchesSkill = selectedSkill ? vendor.tags
        .some((tag) => tag.display_name?.toLowerCase() === selectedSkill.toLowerCase())
        : true;
      return matchesRegion && matchesTravel && matchesSkill;
    });
  }, [vendors, selectedRegion, travelsWorldwide, selectedSkill]);

  // Apply search and sorting
  const searchedAndSortedVendors = useMemo(() => {
    const result: Vendor[] = searchVendors(searchQuery, filteredVendors);

    if (sortOption === 'priceLowToHigh') {
      result.sort((a, b) => {
        if (a.bridal_makeup_price === null) return 1; // Null prices go to the end
        if (b.bridal_makeup_price === null) return -1;
        console.debug("Comparing prices");
        return a.bridal_makeup_price - b.bridal_makeup_price;
      });
    } else if (sortOption === 'priceHighToLow') {
      result.sort((a, b) => {
        if (a.bridal_makeup_price === null) return 1; // Null prices go to the end
        if (b.bridal_makeup_price === null) return -1;
        return b.bridal_makeup_price - a.bridal_makeup_price;
      });
    }

    return result;
  }, [searchQuery, filteredVendors, sortOption]);

  // Load more vendors when scrolling
  const loadMoreVendors = useCallback(() => {
    if (loading) return; // Prevent multiple calls while loading
    setLoading(true);

    setVisibleVendors((prevVendors) => {
      const currentLength = prevVendors.length;
      const nextVendors = searchedAndSortedVendors.slice(currentLength, currentLength + PAGE_SIZE);

      // Prevent duplicate append
      if (nextVendors.length === 0) {
        setLoading(false);
        return prevVendors;
      }

      return [...prevVendors, ...nextVendors];
    });

    setLoading(false);
  }, [loading, searchedAndSortedVendors]);

  const router = useRouter();

  const handleClearFilters = () => {
    router.push("?", { scroll: false }); // Resets URL to base with no query params
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

    const observerCurrent = observerRef.current;
    if (observerCurrent) observer.observe(observerCurrent);

    return () => {
      if (observerCurrent) observer.unobserve(observerCurrent);
    };
  }, [searchedAndSortedVendors, loadMoreVendors]);

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
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* First Row: Location & Search Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', md: 'row' }, // Keep on the same row for both small and large screens
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap', // Allows wrapping for smaller screens
          }}
        >
          <LocationFilter uniqueRegions={uniqueRegions} searchParams={searchParams} />
          <SkillFilter tags={tags} searchParams={searchParams} />
          <TravelFilter searchParams={searchParams} />
          <SearchBar searchParams={searchParams} />

        </Box>

        {/* Second Row: Clear Button */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={handleClearFilters}
            size="small"
            sx={{ width: { xs: '100%', md: 'auto' } }} // Full-width on mobile
          >
            Clear Filters
          </Button>
        </Box>
      </Box>

      <Divider />
      {/* Filtered Vendors Count */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', md: 'row' },
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap', // Allows wrapping for smaller screens
        }}
      >
        <Typography variant="h6">
          {searchedAndSortedVendors.length} artist{searchedAndSortedVendors.length === 1 ? '' : 's'} matched
        </Typography>

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={sortOption || 'default'}
            onChange={(e) => setSortOption(e.target.value)}
            displayEmpty
            size="small"
          >
            <MenuItem value="default">
              <em>Sort: Default</em>
            </MenuItem>
            <MenuItem value="priceLowToHigh">Price: Low to High</MenuItem>
            <MenuItem value="priceHighToLow">Price: High to Low</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Vendor Grid */}
      <VendorGrid
        handleFocus={handleFocus}
        handleBlur={handleBlur}
        focusedCardIndex={focusedCardIndex}
        vendors={visibleVendors}
        searchParams={searchParams.toString()}
        favoriteVendorIds={favoriteVendorIds}
        showFavoriteButton={true}
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

export default function FilterableVendorTable(props: {
  uniqueRegions: string[],
  tags: string[],
  vendors: Vendor[],
  favoriteVendorIds: VendorId[]
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FilterableVendorTableContent {...props} />
    </Suspense>
  );
}
