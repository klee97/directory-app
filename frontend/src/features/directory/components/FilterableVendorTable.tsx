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
import { SearchBar } from './filters/SearchBar';
import { VendorId, VendorTag, VendorByDistance } from '@/types/vendor';
import { LocationResult } from '@/types/location';
import { getVendorsByLocation, searchVendors } from '../api/searchVendors';
import TravelFilter from './filters/TravelFilter';
import { SkillFilter } from './filters/SkillFilter';
import { useRouter, useSearchParams } from 'next/navigation';
import { LOCATION_PARAM, SEARCH_PARAM, SKILL_PARAM, TRAVEL_PARAM } from '@/lib/constants';
import { Suspense } from 'react';
import useScrollRestoration from '@/hooks/useScrollRestoration';
import { debouncedTrackSearch, trackFilterReset, trackFiltersApplied } from '@/utils/analytics/trackFilterEvents';
import LocationAutocomplete from './filters/LocationAutocomplete';
import { SORT_OPTIONS, SortOption } from '@/types/sort';

const PAGE_SIZE = 12;

interface FilterableVendorTableContentProps {
  tags: string[];
  vendors: VendorByDistance[];
  favoriteVendorIds: VendorId[];
}

export function FilterableVendorTableContent({
  tags,
  vendors,
  favoriteVendorIds,
}: FilterableVendorTableContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract search parameters
  const searchQuery = searchParams.get(SEARCH_PARAM) || "";
  const travelsWorldwide = searchParams.get(TRAVEL_PARAM) === "true";

  const selectedSkills = useMemo(() => searchParams.getAll(SKILL_PARAM) || [], [searchParams]);

  // State management
  const [vendorsInRadius, setVendorsInRadius] = useState<VendorByDistance[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS.DEFAULT);
  const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);
  const [visibleVendors, setVisibleVendors] = useState<VendorByDistance[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useScrollRestoration(true);

  // Load vendors based on location filter
  useEffect(() => {
    let cancelled = false;

    const fetchVendorsByDistance = async () => {
      console.log("Fetching vendors by distance for location:", selectedLocation);
      if (!selectedLocation) {
        // If no location is selected, show all vendors by default
        setVendorsInRadius(vendors);
        return;
      }
      setLoading(true);
      const results = await getVendorsByLocation(selectedLocation, vendors);
      if (!cancelled) {
        setVendorsInRadius(results);
      }
      setLoading(false);
    };

    fetchVendorsByDistance();
    return () => {
      cancelled = true;
    };
  }, [selectedLocation, vendors]);


  // Filter vendors based on all criteria
  const filteredVendors = useMemo(() => {
    return vendorsInRadius.filter((vendor) => {
      const matchesTravel = travelsWorldwide ? vendor.travels_world_wide : true;
      const matchesAnySkill = selectedSkills.length > 0 ? selectedSkills
        .map(skill => vendor.tags.some((tag: VendorTag) =>
          // does the vendor have a tag that matches the skill?
          tag.display_name?.toLowerCase() === skill.toLowerCase())
        ).includes(true) : true;
      return matchesTravel && matchesAnySkill;
    });
  }, [vendorsInRadius, travelsWorldwide, selectedSkills]);

  // Apply sorting
  const searchedAndSortedVendors = useMemo(() => {
    const sortedVendors = searchVendors(searchQuery, filteredVendors);
    switch (sortOption) {
      case SORT_OPTIONS.PRICE_ASC:
        sortedVendors.sort((a, b) => {
          if (a.bridal_makeup_price === null) return 1;
          if (b.bridal_makeup_price === null) return -1;
          return a.bridal_makeup_price - b.bridal_makeup_price;
        });
        break;

      case SORT_OPTIONS.PRICE_DESC:
        sortedVendors.sort((a, b) => {
          if (a.bridal_makeup_price === null) return 1;
          if (b.bridal_makeup_price === null) return -1;
          return b.bridal_makeup_price - a.bridal_makeup_price;
        });
        break;

      case SORT_OPTIONS.DISTANCE_ASC:
        sortedVendors.sort((a, b) => {
          if (!a.distance_miles && !b.distance_miles) return 0;
          if (!a.distance_miles) return 1;
          if (!b.distance_miles) return -1;
          return a.distance_miles - b.distance_miles;
        });
        break;
    }

    console.log("Searched and sorted vendors:", sortedVendors);
    return sortedVendors;
  }, [searchQuery, filteredVendors, sortOption]);

  // set default sort option. If location is selected, default to distance sort
  useEffect(() => {
    if (selectedLocation) {
      setSortOption(SORT_OPTIONS.DISTANCE_ASC);
    } else {
      setSortOption(SORT_OPTIONS.DEFAULT);
    }
  }, [selectedLocation]);

  const [prevParams, setPrevParams] = useState<string | null>(null);

  useEffect(() => {
    const currentParams = searchParams.toString();

    if (prevParams !== null && currentParams !== prevParams) {
      const hasSearchChanged = searchQuery !== (searchParams.get(SEARCH_PARAM) || "");

      if (hasSearchChanged) {
        debouncedTrackSearch({
          selectedLocation: selectedLocation?.display_name,
          selectedSkills,
          travelsWorldwide,
          searchQuery,
          sortOption,
          resultCount: searchedAndSortedVendors.length,
        });
      } else {
        trackFiltersApplied(
          selectedLocation?.display_name || "",
          selectedSkills,
          travelsWorldwide,
          searchQuery,
          sortOption.name,
          searchedAndSortedVendors.length
        );
      }
    }

    setPrevParams(currentParams);
  }, [
    prevParams,
    searchParams,
    searchQuery,
    selectedLocation?.display_name,
    selectedSkills,
    travelsWorldwide,
    sortOption,
    searchedAndSortedVendors.length,
  ]);

  // Load more vendors for infinite scroll
  const loadMoreVendors = useCallback(() => {
    if (loading) return;
    setLoading(true);

    setVisibleVendors((prevVendors) => {
      const currentLength = prevVendors.length;
      const nextVendors = searchedAndSortedVendors.slice(currentLength, currentLength + PAGE_SIZE);

      if (nextVendors.length === 0) {
        setLoading(false);
        return prevVendors;
      }

      return [...prevVendors, ...nextVendors];
    });

    setLoading(false);
  }, [loading, searchedAndSortedVendors]);

  // Clear all filters
  const handleClearFilters = () => {
    router.push("?", { scroll: false });
    setSelectedLocation(null);
    trackFilterReset();
  };

  // Reset visible vendors when filtered list changes
  useEffect(() => {
    setVisibleVendors(searchedAndSortedVendors.slice(0, PAGE_SIZE));
  }, [searchedAndSortedVendors]);

  // Intersection Observer for infinite scroll
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
  }, [loadMoreVendors]);

  const handleFocus = (index: number) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Filters and Search Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* First Row: Search Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' },
          }}
        >
          <SearchBar searchParams={searchParams} />
          <LocationAutocomplete
            value={selectedLocation?.display_name || ""}
            onSelect={setSelectedLocation}
          />
        </Box>
        {/* Second Row: Other Filters */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            flexWrap: 'wrap',
          }}
        >
          <SkillFilter tags={tags} searchParams={searchParams} />
          <TravelFilter searchParams={searchParams} />
        </Box>

        {/* Second Row: Clear Button */}
        <Box>
          <Button
            variant="contained"
            onClick={handleClearFilters}
            size="small"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Clear All Filters
          </Button>
        </Box>
      </Box>

      <Divider />

      {/* Results Count and Sorting */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              Loading artists...
            </Box>
          ) : (
            <>
              {searchedAndSortedVendors.length} Wedding Beauty Artist{searchedAndSortedVendors.length === 1 ? '' : 's'} found
              {!!selectedLocation && ` near ${selectedLocation.display_name}`}
            </>
          )}
        </Typography>

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={sortOption}
            onChange={(e) => {
              const selected = Object.values(SORT_OPTIONS).find(opt => opt.name === e.target.value);
              if (selected) setSortOption(selected);
            }}
            renderValue={() => `Sort by: ${sortOption.display}`}
            size="small"
          >
            {Object.values(SORT_OPTIONS).map((option) => (
              <MenuItem key={option.name} value={option.name}>
                {option.display}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {searchedAndSortedVendors.length === 0 && (
        <Box sx={{ textAlign: 'center', padding: 4 }}>
          <Typography variant="body1" gutterBottom>
            Try looking at{' '}
            <Typography
              component="span"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                setSelectedLocation(null);
                params.delete(LOCATION_PARAM);
                params.set(TRAVEL_PARAM, 'true');
                router.push(`?${params.toString()}`, { scroll: false });
              }}
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              artists who travel worldwide
            </Typography>{' '}
            , or broaden your search.
          </Typography>
          <Typography variant="body1">
            If you&apos;d like more recommendations for a region,{' '}
            <Typography
              component="a"
              href="/contact"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              let us know
            </Typography>
            !
          </Typography>
        </Box>
      )}
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
  tags: string[],
  vendors: VendorByDistance[],
  favoriteVendorIds: VendorId[]
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FilterableVendorTableContent {...props} />
    </Suspense>
  );
}