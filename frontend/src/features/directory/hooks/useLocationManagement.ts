import useResolvedLocation from "@/features/directory/hooks/useResolvedLocation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocationSearch } from "./useLocationSearch";
import { LocationResult } from "@/types/location";
import { LocationPageGenerator } from "@/lib/location/LocationPageGenerator";
import reverseGeocodeCache, { createGeocodeKey } from "../components/reverseGeocodeCache";
import { serializeLocation } from "@/lib/location/serializer";
import { LATITUDE_PARAM, LONGITUDE_PARAM } from "@/lib/constants";
import { useRouter } from "next/navigation";

const locationPageGenerator = new LocationPageGenerator();

export const useLocationManagement = ({
  preselectedLocation, searchParams, searchParamsString, useLocationPages
}: {
  preselectedLocation: LocationResult | null,
  searchParams: URLSearchParams,
  searchParamsString: string,
  useLocationPages: boolean,
}) => {

  const [locationInputValue, setLocationInputValue] = useState('');
  const [immediateLocation, setImmediateLocation] = useState<LocationResult | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [validLocationSlugs, setValidLocationSlugs] = useState<Set<string> | null>(null);

  const router = useRouter();

  // Move location sync, selection, and URL management here
  const clearImmediateLocation = useCallback(() => {
    setImmediateLocation(null);
  }, []);

  const selectedLocation: LocationResult | null = useResolvedLocation({
    preselectedLocation,
    immediateLocation,
    searchParams,
    clearImmediateLocation });

  // Location search results
  const {
    instantLocations,
    detailedLocations,
    isInstantLoading,
    isDetailedLoading,
  } = useLocationSearch(locationSearchQuery);

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
      prevSelectedLocationRef.current = selectedLocation;
    }
  }, [selectedLocation]);


  // Handle location selection
  const handleSelectLocation = (location: LocationResult | null) => {
    console.debug('handleSelectLocation called with:', location);
    const params = new URLSearchParams(searchParamsString);
    setImmediateLocation(location);
    if (location) {

      // Update local state immediately for UX, but let the URL change handle the real state
      setLocationInputValue(location.display_name);
      if (location.lat && location.lon) {
        const cacheKey = createGeocodeKey(location.lat, location.lon);
        console.debug(`Adding location to reverse geocode cache with key:"${cacheKey}" for location:`, location);
        reverseGeocodeCache.set(cacheKey, location);
      }
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

    // close keyboard
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const newUrl = `?${params.toString()}`;
    console.debug('Pushing new URL:', newUrl);
    router.push(newUrl, { scroll: false });
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

  // Fetch valid slugs on mount
  useEffect(() => {
    let mounted = true;
    locationPageGenerator.getValidLocationSlugs().then((slugs) => {
      if (mounted) setValidLocationSlugs(slugs);
    });
    return () => { mounted = false; };
  }, []);


  // Handle location input change
  const handleLocationInputChange = (value: string) => {
    setLocationInputValue(value);
  };

  // Handle debounced location search
  const handleLocationDebouncedChange = (value: string) => {
    setLocationSearchQuery(value);
  };

  return {
    selectedLocation,
    locationInputValue,
    handleSelectLocation,
    handleLocationInputChange,
    handleLocationDebouncedChange,
    combinedLocationResults,
    isInstantLoading,
    isDetailedLoading,
  };
};