import useResolvedLocation from "@/features/directory/hooks/useResolvedLocation";
import { useCallback, useMemo, useState } from "react";
import { useLocationSearch } from "./useLocationSearch";
import { LocationResult } from "@/types/location";
import reverseGeocodeCache, { createGeocodeKey } from "@/features/directory/components/reverseGeocodeCache";
import { serializeLocation } from "@/lib/location/serializer";
import { LATITUDE_PARAM, LONGITUDE_PARAM } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useURLFiltersContext } from "@/contexts/URLFiltersContext";

export const useLocationManagement = ({
  preselectedLocation
}: {
  preselectedLocation: LocationResult | null
}) => {

  const [inputOverride, setInputOverride] = useState<string | null>(null);
  const [immediateLocation, setImmediateLocation] = useState<LocationResult | null | undefined>(undefined);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  const { setParams } = useURLFiltersContext();

  const router = useRouter();
  // Move location sync, selection, and URL management here
  const clearImmediateLocation = useCallback(() => {
    setImmediateLocation(null);
  }, []);

  const selectedLocation: LocationResult | null = useResolvedLocation({
    preselectedLocation,
    immediateLocation,
    clearImmediateLocation
  });

  const locationInputValue = inputOverride ?? selectedLocation?.display_name ?? '';

  // Location search results
  const {
    instantLocations,
    detailedLocations,
    isInstantLoading,
    isDetailedLoading,
  } = useLocationSearch(locationSearchQuery, { citiesOnly: false });

  const combinedLocationResults = useMemo(() => {
    console.debug('Combining results:', {
      instantCount: instantLocations.length,
      detailedCount: detailedLocations.length,
    });
    const ids = new Set(instantLocations.map((r) => r.display_name));
    return [...instantLocations, ...detailedLocations.filter((r) => !ids.has(r.display_name))];
  }, [instantLocations, detailedLocations]);

  // Handle location selection
  const handleSelectLocation = (location: LocationResult | null) => {
    console.debug('handleSelectLocation called with:', location);
    setImmediateLocation(location);
    setInputOverride(null); // Drop the override — let selectedLocation drive the value

    if (location) {
      if (location.lat && location.lon) {
        const cacheKey = createGeocodeKey(location.lat, location.lon);
        console.debug(`Adding location to reverse geocode cache with key:"${cacheKey}" for location:`, location);
        reverseGeocodeCache.set(cacheKey, location);
      }
      const serialized = serializeLocation(location);
      console.debug('Serialized location:', serialized);
      if (serialized) {
        const { lat, lon } = serialized;
        console.debug('Setting URL params via useURLFilters:', { lat, lon });
        // If we're on a location page, navigate to home with new coordinates
        if (preselectedLocation) {
          const currentParams = new URLSearchParams(window.location.search);
          currentParams.set(LATITUDE_PARAM, String(lat));
          currentParams.set(LONGITUDE_PARAM, String(lon));
          const paramsString = currentParams.toString();
          router.push(paramsString ? `/?${paramsString}` : '/', { scroll: false });
        } else {
          // On home page, just update URL params
          setParams({
            [LATITUDE_PARAM]: String(lat),
            [LONGITUDE_PARAM]: String(lon)
          });
        }
      }
    } else {
      // Clear everything immediately
      setLocationSearchQuery('');
      // If on location page, go home; otherwise just clear params
      if (preselectedLocation) {
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.delete(LATITUDE_PARAM);
        currentParams.delete(LONGITUDE_PARAM);
        const paramsString = currentParams.toString();
        router.push(paramsString ? `/?${paramsString}` : '/', { scroll: false });
      } else {
        setParams({
          [LATITUDE_PARAM]: null,
          [LONGITUDE_PARAM]: null
        });
      }
    }

    // close keyboard
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // Handle location input change
  const handleLocationInputChange = (value: string) => {
    setInputOverride(value);
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