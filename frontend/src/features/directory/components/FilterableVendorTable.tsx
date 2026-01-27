"use client"
import React, { useState, useMemo } from 'react';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import { VendorGrid } from './VendorGrid';
import { SearchBar } from './filters/SearchBar';
import { VendorId, VendorByDistance } from '@/types/vendor';
import { LocationResult } from '@/types/location';
import { useRouter, useSearchParams } from 'next/navigation';
import { SEARCH_PARAM, SKILL_PARAM, TRAVEL_PARAM, LATITUDE_PARAM, LONGITUDE_PARAM, SERVICE_PARAM } from '@/lib/constants';
import { Suspense } from 'react';
import useScrollRestoration from '@/hooks/useScrollRestoration';
import { trackFilterReset } from '@/utils/analytics/trackFilterEvents';
import LocationAutocomplete from './filters/LocationAutocomplete';
import { useVendorFiltering } from '../hooks/useVendorFiltering';
import { useLocationManagement } from '../hooks/useLocationManagement';
import { useSearchManagement } from '../hooks/useSearchManagement';
import { usePagination } from '../hooks/usePagination';
import { useAnalyticsTracking } from '../hooks/useAnalyticsTracking';
import { FilterSection } from './tableLayout/FilterSection';
import { ResultsHeader } from './tableLayout/ResultsHeader';
import { URLFiltersProvider } from '@/contexts/URLFiltersContext';
import { useURLFilters } from '@/hooks/useURLFilters';
import { FilterTags } from '@/lib/directory/filterTags';

const PAGE_SIZE = 12;
const FILTER_MIN_WIDTH = 240;
const SEARCH_FILTER_GAP = 16;

interface FilterableVendorTableContentProps {
  tags: FilterTags;
  vendors: VendorByDistance[];
  favoriteVendorIds: VendorId[];
  preselectedLocation: LocationResult | null;
  useLocationPages?: boolean;
}

export function FilterableVendorTableContent({
  tags,
  vendors,
  favoriteVendorIds,
  preselectedLocation = null
}: FilterableVendorTableContentProps) {
  const searchParams = useSearchParams();
  const searchParamsString = useMemo(() => searchParams?.toString() ?? "", [searchParams]);
  const router = useRouter();

  // Extract search parameters
  const searchQuery = searchParams?.get(SEARCH_PARAM) || "";
  const travelsWorldwide = searchParams?.get(TRAVEL_PARAM) === "true";
  const selectedSkills = useMemo(() => searchParams?.getAll(SKILL_PARAM) || [], [searchParams]);
  const selectedServices = useMemo(() => searchParams?.getAll(SERVICE_PARAM) || [], [searchParams]);

  // State management
  const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);
  const { setParams } = useURLFilters();

  useScrollRestoration(true);

  const locationManagement = useLocationManagement({ preselectedLocation });

  const vendorFiltering = useVendorFiltering({
    vendors,
    selectedLocation: locationManagement.selectedLocation,
    travelsWorldwide,
    selectedSkills,
    selectedServices,
    searchQuery,
  });

  const searchManagement = useSearchManagement();

  useAnalyticsTracking({
    searchParams,
    searchQuery,
    selectedLocationName: locationManagement.selectedLocation?.display_name ?? null,
    selectedSkills,
    selectedServices,
    travelsWorldwide,
    sortOptionName: vendorFiltering.sortOption.name,
    resultCount: vendorFiltering.searchedAndSortedVendors.length,
  });

  const pagination = usePagination({
    items: vendorFiltering.searchedAndSortedVendors,
    pageSize: PAGE_SIZE,
    loading: vendorFiltering.loading,
    onLoadingChange: vendorFiltering.setLoading
  });

  const handleClearFilters = () => {
    setParams({
      [SKILL_PARAM]: null,
      [TRAVEL_PARAM]: null
    });
    trackFilterReset();
  };

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
          <SearchBar
            value={searchManagement.searchQuery}
            onChange={searchManagement.updateSearchQuery}
          />
          <LocationAutocomplete
            inputValue={locationManagement.locationInputValue}
            onInputChange={locationManagement.handleLocationInputChange}
            onDebouncedChange={locationManagement.handleLocationDebouncedChange}
            selectedLocation={locationManagement.selectedLocation}
            onSelect={locationManagement.handleSelectLocation}
            results={locationManagement.combinedLocationResults}
            loading={locationManagement.isInstantLoading || locationManagement.isDetailedLoading}
            placeholder="Search for a city, state, or country"
          />
        </Box>
      </Box>
      <Divider />
      <Box sx={{
        display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2
      }}>
        {/* Other Filters */}
        <FilterSection
          tags={tags}
          onClearFilters={handleClearFilters}
          filterMinWidth={FILTER_MIN_WIDTH}
        />
        <Divider />

        {/* Results Count and Sorting */}
        <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 2 }}>
          <ResultsHeader
            loading={vendorFiltering.loading}
            resultCount={vendorFiltering.searchedAndSortedVendors.length}
            selectedLocation={locationManagement.selectedLocation}
            sortOption={vendorFiltering.sortOption}
            onSortChange={vendorFiltering.setSortOption}
          />

          {vendorFiltering.searchedAndSortedVendors.length === 0 && (
            <Box sx={{ textAlign: 'center', padding: 4 }}>
              <Typography variant="body1" gutterBottom>
                Try looking at{' '}
                <Typography
                  component="span"
                  onClick={() => {
                    const params = new URLSearchParams(searchParamsString);
                    params.set(TRAVEL_PARAM, 'true');
                    if (!preselectedLocation) {
                      params.delete(LATITUDE_PARAM);
                      params.delete(LONGITUDE_PARAM);
                      locationManagement.handleSelectLocation(null);
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
                </Typography>{''}
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
            vendors={pagination.visibleItems}
            searchParams={searchParamsString}
            favoriteVendorIds={favoriteVendorIds}
            showFavoriteButton={true}
            filterContext={
              {
                selectedLocationName: locationManagement.selectedLocation?.display_name ?? null,
                selectedSkills,
                selectedServices,
                travelsWorldwide,
                searchQuery,
                sortOptionName: vendorFiltering.sortOption.name,
                resultCount: vendorFiltering.searchedAndSortedVendors.length,
              }
            }
          />

          {/* Loading Spinner */}
          {pagination.isLoading || vendorFiltering.loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Intersection observer target */}
          <div ref={pagination.observerRef} style={{ height: 1 }} />
        </Box>
      </Box>
    </Box >
  );
}

export default function FilterableVendorTable(props: {
  tags: FilterTags,
  vendors: VendorByDistance[],
  favoriteVendorIds: VendorId[],
  preselectedLocation?: LocationResult | null,
  useLocationPages?: boolean,
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <URLFiltersProvider preservePathname={props.useLocationPages ?? false}>
        <FilterableVendorTableContent
          {...props}
          preselectedLocation={props.preselectedLocation ?? null}
        />
      </URLFiltersProvider>
    </Suspense>
  );
}