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
import { SEARCH_PARAM, SKILL_PARAM, TRAVEL_PARAM, LATITUDE_PARAM, LONGITUDE_PARAM } from '@/lib/constants';
import { Suspense } from 'react';
import useScrollRestoration from '@/hooks/useScrollRestoration';
import { debouncedTrackSearch, trackFilterReset, trackFiltersApplied } from '@/utils/analytics/trackFilterEvents';
import LocationAutocomplete from './filters/LocationAutocomplete';
import { SORT_OPTIONS, SortOption } from '@/types/sort';
import { LocationPageGenerator } from '@/lib/location/LocationPageGenerator';
import { FilterContext } from './filters/FilterContext';
import { parseLatLonFromParams, serializeLocation } from '@/lib/location/serializer';
import useResolvedLocation from '@/hooks/useResolvedLocation';
import { useSearch } from '@/hooks/useSearch';

const PAGE_SIZE = 12;
const FILTER_MIN_WIDTH = 240;
const SEARCH_FILTER_GAP = 16;
const locationPageGenerator = new LocationPageGenerator();
const reverseGeocodeCache = new Map<string, LocationResult>();

interface FilterableVendorTableContentProps {
  tags: string[];
  vendors: VendorByDistance[];
  favoriteVendorIds: VendorId[];
  preselectedLocation: LocationResult | null;
  useLocationPages?: boolean;
}

export function FilterableVendorTableContent({
  tags,
  vendors,
  favoriteVendorIds,
  preselectedLocation = null,
  useLocationPages = false,
}: FilterableVendorTableContentProps) {
  const searchParams = useSearchParams();
  const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);
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
  const [loading, setLoading] = useState(false);
  const [validLocationSlugs, setValidLocationSlugs] = useState<Set<string> | null>(null);
  
  // Location input state
  const [locationInputValue, setLocationInputValue] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  
  const observerRef = useRef<HTMLDivElement | null>(null);

  useScrollRestoration(true);

  const selectedLocation = useResolvedLocation({ preselectedLocation, searchParams });

  // Debug logging to track location changes
  useEffect(() => {
    const lat = searchParams.get(LATITUDE_PARAM);
    const lon = searchParams.get(LONGITUDE_PARAM);
    console.debug('selectedLocation changed:', {
      display_name: selectedLocation?.display_name,
      latitude: selectedLocation?.lat,
      longitude: selectedLocation?.lon,
      searchParams: searchParams.toString(),
      urlLat: lat,
      urlLon: lon
    });
  }, [selectedLocation, searchParams]);

  // Location search results
  const {
    instantLocations,
    detailedLocations,
    isInstantLoading,
    isDetailedLoading,
  } = useSearch(locationSearchQuery);

  const combinedLocationResults = useMemo(() => {
    console.debug('Combining results:', {
      instantCount: instantLocations.length,
      detailedCount: detailedLocations.length,
    });
    const ids = new Set(instantLocations.map((r) => r.display_name));
    return [...instantLocations, ...detailedLocations.filter((r) => !ids.has(r.display_name))];
  }, [instantLocations, detailedLocations]);

  // Sync location input value with selected location
  // Only sync when selectedLocation actually changes, not when search query changes
  const prevSelectedLocationRef = useRef<LocationResult | null>(null);
  useEffect(() => {
    // Only sync if selectedLocation actually changed
    if (prevSelectedLocationRef.current !== selectedLocation) {
      const displayName = selectedLocation?.display_name || '';
      setLocationInputValue(displayName);
      setLocationSearchQuery(displayName);
      prevSelectedLocationRef.current = selectedLocation;
    }
  }, [selectedLocation]);

  // Load vendors based on location filter
  useEffect(() => {
    let cancelled = false;

    const fetchVendorsByDistance = async () => {
      // Check if we have a valid location with required properties
      const hasValidLocation = selectedLocation && 
        selectedLocation.display_name && 
        selectedLocation.lat !== undefined && 
        selectedLocation.lon !== undefined;

      if (!hasValidLocation) {
        // If no valid location is selected, show all vendors by default
        console.debug('No valid location, showing all vendors');
        setVendorsInRadius(vendors);
        setLoading(false);
        return;
      }
      
      console.debug('Fetching vendors for location:', selectedLocation.display_name);
      setLoading(true);
      
      try {
        const results = await getVendorsByLocation(selectedLocation, vendors);
        if (!cancelled) {
          console.debug('Vendors loaded:', results.length);
          setVendorsInRadius(results);
        }
      } catch (error) {
        console.error('Error loading vendors by location:', error);
        if (!cancelled) {
          setVendorsInRadius(vendors); // fallback to all vendors
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchVendorsByDistance();
    return () => {
      cancelled = true;
    };
  }, [selectedLocation?.display_name, selectedLocation?.lat, selectedLocation?.lon, vendors]);

  // Fetch valid slugs on mount
  useEffect(() => {
    let mounted = true;
    locationPageGenerator.getValidLocationSlugs().then((slugs) => {
      if (mounted) setValidLocationSlugs(slugs);
    });
    return () => { mounted = false; };
  }, []);

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
    const currentParams = searchParamsString;

    if (prevParams !== null && currentParams !== prevParams) {
      const hasSearchChanged = searchQuery !== (searchParams.get(SEARCH_PARAM) || "");
      const filterContext: FilterContext = {
        selectedLocationName: selectedLocation?.display_name ?? null,
        selectedSkills,
        travelsWorldwide,
        searchQuery,
        sortOptionName: sortOption.name,
        resultCount: searchedAndSortedVendors.length,
      }
      if (hasSearchChanged) {
        debouncedTrackSearch(filterContext);
      } else {
        trackFiltersApplied(filterContext);
      }
    }

    setPrevParams(currentParams);
  }, [
    prevParams,
    searchParams,
    searchParamsString,
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

  // Clear filters
  const handleClearFilters = () => {
    const newParams = new URLSearchParams(searchParamsString);
    newParams.delete(SKILL_PARAM);
    newParams.delete(TRAVEL_PARAM);

    // Use router.push() to update the URL while keeping other params
    router.push(`?${newParams.toString()}`, { scroll: false });
    trackFilterReset();
  };

  // Handle location selection
  const handleSelectLocation = (location: LocationResult | null) => {
    console.debug('handleSelectLocation called with:', location?.display_name);
    const params = new URLSearchParams(searchParamsString);
    if (location) {
      // Update local state immediately for UX, but let the URL change handle the real state
      setLocationInputValue(location.display_name);
      
      const serialized = serializeLocation(location);
      console.debug('Serialized location:', serialized);
      if (serialized) {
        const { lat, lon } = serialized;
        params.set(LATITUDE_PARAM, String(lat));
        params.set(LONGITUDE_PARAM, String(lon));
        console.debug('Setting URL params:', { lat, lon });
      }
    } else {
      // Clear everything immediately
      setLocationInputValue('');
      setLocationSearchQuery('');
      params.delete(LATITUDE_PARAM);
      params.delete(LONGITUDE_PARAM);
      console.debug('Clearing location params');
    }
    const newUrl = `?${params.toString()}`;
    console.debug('Pushing new URL:', newUrl);
    router.push(newUrl, { scroll: false });
  };

  // Handle location input change
  const handleLocationInputChange = (value: string) => {
    setLocationInputValue(value);
  };

  // Handle debounced location search
  const handleLocationDebouncedChange = (value: string, prev: string) => {
    setLocationSearchQuery(value);
  };

  // Handle clear location selection for location-specific pages
  useEffect(() => {
    // go home when no location is selected
    if (preselectedLocation && selectedLocation === null) {
      const newParams = new URLSearchParams(searchParamsString);
      newParams.delete(LATITUDE_PARAM);
      newParams.delete(LONGITUDE_PARAM);
      const url = newParams.toString() ? `/?${newParams.toString()}` : '/';
      router.push(url, { scroll: false });
      return;
    }

    if (validLocationSlugs === null) return;
    if (preselectedLocation?.display_name === selectedLocation?.display_name) return;

    // If a new location is selected and useLocationPages is enabled, check for a location page
    if (useLocationPages && selectedLocation) {
      const slug = locationPageGenerator.getSlugFromLocation(selectedLocation);
      if (slug && validLocationSlugs.has(slug)) {
        console.debug("Found location page for:", selectedLocation.display_name);
        const params = searchParamsString;
        const url = params ? `/${slug}?${params}` : `/${slug}`;
        router.push(url, { scroll: false });
        return;
      }
    }
  }, [preselectedLocation, selectedLocation, router, searchParamsString, useLocationPages, validLocationSlugs]);

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2 }}>
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
          <Box minWidth={FILTER_MIN_WIDTH + SEARCH_FILTER_GAP} />
          <SearchBar searchParams={searchParams} />
          <LocationAutocomplete
            inputValue={locationInputValue}
            onInputChange={handleLocationInputChange}
            onDebouncedChange={handleLocationDebouncedChange}
            selectedLocation={selectedLocation}
            onSelect={handleSelectLocation}
            results={combinedLocationResults}
            loading={isInstantLoading || isDetailedLoading}
          />
        </Box>
      </Box>
      <Divider />
      <Box sx={{
        display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2
      }}>
        {/* Other Filters */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'stretch',
            flexWrap: 'wrap',
          }}
        >
          <SkillFilter tags={tags} searchParams={searchParams} filterMinWidth={FILTER_MIN_WIDTH} />
          <TravelFilter searchParams={searchParams} filterMinWidth={FILTER_MIN_WIDTH} />
          {/* Second Row: Clear Button */}
          <Button
            variant="contained"
            onClick={handleClearFilters}
            size="small"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Clear Filters
          </Button>
        </Box>
        <Divider />

        {/* Results Count and Sorting */}
        <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
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
                value={sortOption.name}
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
                    const params = new URLSearchParams(searchParamsString);
                    params.set(TRAVEL_PARAM, 'true');
                    if (!preselectedLocation) {
                      params.delete("lat");
                      params.delete("lon");
                      handleSelectLocation(null);
                    }
                    router.push(`/?${params.toString()}`);
                  }}
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  artists who travel worldwide
                </Typography>
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
            searchParams={searchParamsString}
            favoriteVendorIds={favoriteVendorIds}
            showFavoriteButton={true}
            filterContext={
              {
                selectedLocationName: selectedLocation?.display_name ?? null,
                selectedSkills,
                travelsWorldwide,
                searchQuery,
                sortOptionName: sortOption.name,
                resultCount: searchedAndSortedVendors.length,
              }
            }
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
      </Box>
    </Box >
  );
}

export default function FilterableVendorTable(props: {
  tags: string[],
  vendors: VendorByDistance[],
  favoriteVendorIds: VendorId[],
  preselectedLocation?: LocationResult | null,
  useLocationPages?: boolean,
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FilterableVendorTableContent
        {...props}
        preselectedLocation={props.preselectedLocation ?? null}
        useLocationPages={props.useLocationPages ?? false}
      />
    </Suspense>
  );
}