import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocationSearch } from "@/features/directory/hooks/useLocationSearch";
import { LocationResult } from "@/types/location";

interface UseLocationFormProps {
  initialLocation?: LocationResult | null;
  onLocationChange?: (location: LocationResult | null) => void;
  citiesOnly?: boolean;
}

/**
 * Simplified location management hook for forms (no URL param syncing)
 */
export const useLocationForm = ({
  initialLocation = null,
  onLocationChange,
  citiesOnly = false,
}: UseLocationFormProps = {}) => {
  const [locationInputValue, setLocationInputValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(initialLocation);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // Location search results
  const {
    instantLocations,
    detailedLocations,
    isInstantLoading,
    isDetailedLoading,
  } = useLocationSearch(locationSearchQuery, { citiesOnly });

  const combinedLocationResults = useMemo(() => {
    const ids = new Set(instantLocations.map((r) => r.display_name));
    return [...instantLocations, ...detailedLocations.filter((r) => !ids.has(r.display_name))];
  }, [instantLocations, detailedLocations]);

  // Sync location input value with selected location
  const prevSelectedLocationRef = useRef<LocationResult | null>(null);
  useEffect(() => {
    if (prevSelectedLocationRef.current !== selectedLocation) {
      const displayName = selectedLocation?.display_name || '';
      setLocationInputValue(displayName);
      prevSelectedLocationRef.current = selectedLocation;
    }
  }, [selectedLocation]);

  // Handle location selection
  const handleSelectLocation = useCallback((location: LocationResult | null) => {
    setSelectedLocation(location);
    
    if (location) {
      setLocationInputValue(location.display_name);
    } else {
      setLocationInputValue('');
      setLocationSearchQuery('');
    }

    // Close keyboard
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Notify parent
    onLocationChange?.(location);
  }, [onLocationChange]);

  // Handle location input change
  const handleLocationInputChange = useCallback((value: string) => {
    setLocationInputValue(value);
  }, []);

  // Handle debounced location search
  const handleLocationDebouncedChange = useCallback((value: string) => {
    setLocationSearchQuery(value);
  }, []);

  // Get coordinates from selected location
  const getCoordinates = useCallback((): string | null => {
    if (!selectedLocation?.lat || !selectedLocation?.lon) {
      return null;
    }
    return `${selectedLocation.lat},${selectedLocation.lon}`;
  }, [selectedLocation]);

  return {
    selectedLocation,
    locationInputValue,
    handleSelectLocation,
    handleLocationInputChange,
    handleLocationDebouncedChange,
    combinedLocationResults,
    isLoading: isInstantLoading || isDetailedLoading,
    getCoordinates,
  };
};