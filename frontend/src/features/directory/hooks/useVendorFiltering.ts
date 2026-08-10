import { LATITUDE_PARAM, LONGITUDE_PARAM } from "@/lib/constants";
import { useEffect, useMemo, useRef, useState } from "react";
import { filterVendorsByLocation, isCountrySelection, isStateSelection, searchVendors } from "@/features/directory/api/searchVendors";
import { VendorByDistance, VendorTag } from "@/types/vendor";
import { LocationResult } from "@/types/location";
import { SORT_OPTIONS, SortOption } from "@/types/sort";
import { useURLFiltersContext } from "@/contexts/URLFiltersContext";
import { getVendorsByLocation } from "@/features/directory/api/fetchVendorsByLocation";

export const useVendorFiltering = ({
  vendors,
  selectedLocation,
  initialVendorsLocation,
  isLocationResolving,
  travelsWorldwide,
  selectedSkills,
  selectedServices,
  searchQuery,
}: {
  vendors: VendorByDistance[],
  selectedLocation: LocationResult | null,
  initialVendorsLocation: LocationResult | null, // The location that the server-provided `vendors` prop was actually fetched for
  isLocationResolving: boolean,
  travelsWorldwide: boolean,
  selectedSkills: string[],
  selectedServices: string[],
  searchQuery: string,
}) => {
  // Seed from the server-provided `vendors` prop instead of an empty array.
  // `vendors` is already correctly filtered for the initial/preselected
  // location (see getLocationPageData server-side), so there's no reason
  // the first paint should show zero results while an effect re-fetches
  // data the server already computed.
  const [vendorsInRadius, setVendorsInRadius] = useState<VendorByDistance[]>(vendors);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS.DEFAULT);

  // Keyed to what the server data actually describes (an explicit prop),
  // not to whatever `selectedLocation`/`isLocationResolving` state happens
  // to be true on "the first effect run" — run order is not a reliable
  // proxy for "this is the location `vendors` was fetched for".
  const serverLocationKey = useRef(
    initialVendorsLocation &&
      initialVendorsLocation.lat !== undefined &&
      initialVendorsLocation.lon !== undefined
      ? `${initialVendorsLocation.lat},${initialVendorsLocation.lon}`
      : null
  );
  const hasUsedServerData = useRef(false);

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

      // Skip the redundant client-side fetch only when: (a) we know what
      // location the server data describes (serverLocationKey is non-null,
      // i.e. the caller told us), (b) the resolved location matches it
      // exactly, and (c) we haven't already consumed this pass.
      const currentKey = `${selectedLocation.lat},${selectedLocation.lon}`;
      if (
        !hasUsedServerData.current &&
        serverLocationKey.current !== null &&
        currentKey === serverLocationKey.current
      ) {
        hasUsedServerData.current = true;
        setVendorsInRadius(vendors);
        setLoading(false);
        return;
      }

      setLoading(true);
      console.debug('[useVendorFiltering] Fetching vendors for location:', selectedLocation.display_name);
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
            console.debug('[useVendorFiltering] Vendors loaded:', results.length);
            setVendorsInRadius(results);
          }
        } catch (error) {
          console.error('Error loading vendors by location:', error);
          if (!cancelled) {
            setVendorsInRadius(vendors); // Fallback to all vendors
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