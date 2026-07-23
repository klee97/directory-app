import { LATITUDE_PARAM, LONGITUDE_PARAM } from "@/lib/constants";
import { useEffect, useMemo, useState } from "react";
import { filterVendorsByLocation, isCountrySelection, isStateSelection, searchVendors } from "@/features/directory/api/searchVendors";
import { VendorByDistance, VendorTag } from "@/types/vendor";
import { LocationResult } from "@/types/location";
import { SORT_OPTIONS, SortOption } from "@/types/sort";
import { useURLFiltersContext } from "@/contexts/URLFiltersContext";
import { getVendorsByLocation } from "@/features/directory/api/fetchVendorsByLocation";

export const useVendorFiltering = ({
  vendors,
  selectedLocation,
  isLocationResolving,
  travelsWorldwide,
  selectedSkills,
  selectedServices,
  searchQuery,
}: {
  vendors: VendorByDistance[],
  selectedLocation: LocationResult | null,
  isLocationResolving: boolean,
  travelsWorldwide: boolean,
  selectedSkills: string[],
  selectedServices: string[],
  searchQuery: string,
}) => {
  const [vendorsInRadius, setVendorsInRadius] = useState<VendorByDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS.DEFAULT);

  const { getParam } = useURLFiltersContext();
  const urlLat = getParam(LATITUDE_PARAM);
  const urlLon = getParam(LONGITUDE_PARAM);

  useEffect(() => {
    let cancelled = false;

    const fetchVendorsByDistance = async () => {

      // Only show loading while the location is still resolving —
      // NOT just because selectedLocation is null, since that's also the
      // terminal "reverse-geocode found nothing" state. Relying on
      // selectedLocation's nullness alone can never distinguish the two,
      // which is what caused this to spin forever.
      if (isLocationResolving) {
        setLoading(true);
        return;
      }

      // Guard against stale selectedLocation only when we actually have a
      // selectedLocation to compare against. If it's null (genuinely
      // resolved to "not found"), there's nothing to compare, so fall
      // through to the hasValidLocation check below instead of bailing here.
      if (urlLat && urlLon && selectedLocation) {
        const urlLatNum = parseFloat(urlLat);
        const urlLonNum = parseFloat(urlLon);
        const locationLat = selectedLocation.lat;
        const locationLon = selectedLocation.lon;

        if (locationLat === undefined || locationLat === null || locationLon === undefined || locationLon === null) {
          console.debug('Location latitude or longitude is undefined, skipping fetch.');
          return;
        }

        const latMatch = Math.abs(urlLatNum - locationLat) < 0.0001;
        const lonMatch = Math.abs(urlLonNum - locationLon) < 0.0001;

        if (!latMatch || !lonMatch) {
          console.debug('Location/URL mismatch, skipping fetch. URL:', { urlLatNum, urlLonNum }, 'Location:', { locationLat, locationLon });
          return; // Skip fetch, location is still resolving to a different point
        }
      }

      const hasValidLocation = selectedLocation &&
        selectedLocation.display_name &&
        selectedLocation.lat !== undefined &&
        selectedLocation.lon !== undefined;

      if (!hasValidLocation) {
        console.debug('No valid location, showing all vendors');
        setVendorsInRadius(vendors);
        setLoading(false);
        return;
      }

      setLoading(true);
      console.debug('Fetching vendors for location:', selectedLocation.display_name);
      if (isStateSelection(selectedLocation) || isCountrySelection(selectedLocation)) {
        const results = filterVendorsByLocation(selectedLocation, vendors);
        if (!cancelled) {
          setVendorsInRadius(results);
          setLoading(false);
        }
      } else {
        try {
          const results = await getVendorsByLocation(selectedLocation);
          if (!cancelled) {
            console.debug('Vendors loaded:', results.length);
            setVendorsInRadius(results);
          }
        } catch (error) {
          console.error('Error loading vendors by location:', error);
          if (!cancelled) {
            setVendorsInRadius(vendors);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }
    };

    fetchVendorsByDistance();
    return () => {
      cancelled = true;
    };
  }, [urlLat, urlLon, selectedLocation, isLocationResolving, vendors]);

  // Filter vendors based on all criteria
  const filteredVendors = useMemo(() => {
    return vendorsInRadius.filter((vendor) => {
      const matchesTravel = travelsWorldwide ? vendor.travels_world_wide : true;
      if (!matchesTravel) return false; // short circuit if travel doesn't match

      const matchesAnySkill = selectedSkills.length > 0
        ? selectedSkills.some(skill =>
          vendor.tags.some((tag: VendorTag) =>
            tag.display_name?.toLowerCase() === skill.toLowerCase()
          )
        )
        : true;
      if (!matchesAnySkill) return false;

      const matchesAnyService = selectedServices.length > 0
        ? selectedServices.some(service =>
          vendor.tags.some((tag: VendorTag) =>
            tag.display_name?.toLowerCase() === service.toLowerCase()
          )
        )
        : true;
      return matchesAnyService;
    });
  }, [vendorsInRadius, travelsWorldwide, selectedSkills, selectedServices]);

  // Apply sorting
  const searchedAndSortedVendors = useMemo(() => {
    const sortedVendors = searchVendors(searchQuery, filteredVendors);
    sortedVendors.sort((a, b) => {
      if (a.is_premium && !b.is_premium) return -1;
      if (!a.is_premium && b.is_premium) return 1;
      return 0; // both same premium status, move on to next sort
    });
    switch (sortOption) {
      case SORT_OPTIONS.DEFAULT:
        sortedVendors.sort((a, b) => getVendorPriority(a) - getVendorPriority(b));
        break;

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

function getVendorPriority(vendor: VendorByDistance): number {
  if (vendor.is_premium || vendor.verified_at) return 0;
  if (vendor.images.length > 0) return 1;
  return 2;
}