import { LATITUDE_PARAM, LONGITUDE_PARAM } from "@/lib/constants";
import { useEffect, useMemo, useState } from "react";
import { getVendorsByLocation, searchVendors } from "../api/searchVendors";
import { VendorByDistance, VendorTag } from "@/types/vendor";
import { LocationResult } from "@/types/location";
import { SORT_OPTIONS, SortOption } from "@/types/sort";

export const useVendorFiltering = ({
  vendors,
  searchParams,
  selectedLocation,
  travelsWorldwide,
  selectedSkills,
  searchQuery,
}: {
  vendors: VendorByDistance[],
  searchParams: URLSearchParams,
  selectedLocation: LocationResult | null,
  travelsWorldwide: boolean,
  selectedSkills: string[],
  searchQuery: string,
}) => {
  const [vendorsInRadius, setVendorsInRadius] = useState<VendorByDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS.DEFAULT);
  const [initialLoad, setInitialLoad] = useState(true);

  // Load vendors based on location filter
  useEffect(() => {
    let cancelled = false;

    const fetchVendorsByDistance = async () => {

      const urlLat = searchParams.get(LATITUDE_PARAM);
      const urlLon = searchParams.get(LONGITUDE_PARAM);

      // If we have URL params but no resolved location yet, show loading
      if ((urlLat && urlLon) && !selectedLocation && initialLoad) {
        setLoading(true);
        return;
      }

      // Check if the current location matches the URL params to avoid stale fetches
      if (urlLat && urlLon) {
        const urlLatNum = parseFloat(urlLat);
        const urlLonNum = parseFloat(urlLon);
        const locationLat = selectedLocation?.lat;
        const locationLon = selectedLocation?.lon;

        // Only proceed if locationLat and locationLon are defined
        if (locationLat === undefined || locationLon === undefined) {
          console.debug('Location latitude or longitude is undefined, skipping fetch.');
          return;
        }

        // Allow for small floating point differences
        const latMatch = Math.abs(urlLatNum - locationLat) < 0.0001;
        const lonMatch = Math.abs(urlLonNum - locationLon) < 0.0001;

        if (!latMatch || !lonMatch) {
          console.debug('Location/URL mismatch, skipping fetch. URL:', { urlLatNum, urlLonNum }, 'Location:', { locationLat, locationLon });
          return; // Skip fetch, location is still resolving
        }
      }

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
        setInitialLoad(false);
        return;
      }

      setLoading(true);
      console.debug('Fetching vendors for location:', selectedLocation.display_name);

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
          setInitialLoad(false);
        }
      }
    };

    fetchVendorsByDistance();
    return () => {
      cancelled = true;
    };
  }, [selectedLocation, vendors, searchParams, initialLoad]);

  // Filter vendors based on all criteria
  const filteredVendors = useMemo(() => {
    return vendorsInRadius.filter((vendor) => {
      const matchesTravel = travelsWorldwide ? vendor.travels_world_wide : true;
      const matchesAnySkill = selectedSkills.length > 0
        ? selectedSkills.some(skill =>
          vendor.tags.some((tag: VendorTag) =>
            tag.display_name?.toLowerCase() === skill.toLowerCase()
          )
        )
        : true;
      return matchesTravel && matchesAnySkill;
    });
  }, [vendorsInRadius, travelsWorldwide, selectedSkills]);

  // Apply sorting
  const searchedAndSortedVendors = useMemo(() => {
    const sortedVendors = searchVendors(searchQuery, filteredVendors);
    sortedVendors.sort((a, b) => {
      if (a.is_premium && !b.is_premium) return -1;
      if (!a.is_premium && b.is_premium) return 1;
      return 0; // both same premium status, move on to next sort
    });
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
          // Still keep premium first
          if (a.is_premium && !b.is_premium) return -1;
          if (!a.is_premium && b.is_premium) return 1;

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
  

  return {
    vendorsInRadius,
    filteredVendors,
    searchedAndSortedVendors,
    sortOption,
    setSortOption,
    loading,
    setLoading
  };
};