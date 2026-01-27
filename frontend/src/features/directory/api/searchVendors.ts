"use client";

import { LOCATION_TYPE_COUNTRY, LOCATION_TYPE_PRESET_REGION, LOCATION_TYPE_STATE, LocationResult } from "@/types/location";
import { VendorByDistance } from "@/types/vendor";

export function searchVendors(searchQuery: string, vendors: VendorByDistance[]): VendorByDistance[] {
  const regex = new RegExp(searchQuery, "i"); // "i" makes it case-insensitive
  const results = vendors.filter(vendor =>
    regex.test(vendor.business_name?.toString() ?? '') ||
    regex.test(vendor.region?.toString() ?? '') ||
    regex.test(vendor.metro?.toString() ?? '') ||
    regex.test(vendor.metro_region?.toString() ?? '') ||
    regex.test(vendor.instagram?.toString() ?? '')
  );
  return results;
}

export function filterVendorsByLocation(location: LocationResult, vendors: VendorByDistance[]): VendorByDistance[] {
  if (location.type === LOCATION_TYPE_PRESET_REGION) {
    return filterVendorByRegion(location.display_name, vendors);
  } else if (location.type === LOCATION_TYPE_COUNTRY && location.address?.country) {
    return filterVendorsByCountry(location, vendors);
  } else if (location.type === LOCATION_TYPE_STATE && location.address?.state) {
    return filterVendorsByState(location, vendors);
  } else {
    return vendors; // Return all if no specific filter
  }
}

export function filterVendorsByState(
  location: LocationResult,
  vendors: VendorByDistance[]
): VendorByDistance[] {
  if (!location.address?.state) {
    console.warn("No state provided in location:", location);
    return [];
  }
  return vendors.filter(vendor =>
    vendor.state?.toLowerCase() === location.address?.state?.toLowerCase()
  );
}

export function filterVendorsByCountry(
  location: LocationResult,
  vendors: VendorByDistance[]
): VendorByDistance[] {
  if (!location.address?.country) {
    console.warn("No country provided in location:", location);
    return [];
  }
  return vendors.filter(vendor =>
    vendor.country?.toLowerCase() === location.address?.country?.toLowerCase()
  );
}


export function filterVendorByRegion(
  region: string,
  vendors: VendorByDistance[]
): VendorByDistance[] {
  const results = vendors.filter(vendor =>
    vendor.metro_region?.toLowerCase().includes(region.toLowerCase())
  );
  return results;
}

export function isStateSelection(location: LocationResult) {
  return (
    location.type === LOCATION_TYPE_STATE
  );
}

export function isCountrySelection(location: LocationResult) {
  return (
    location.type === LOCATION_TYPE_COUNTRY
  );
}
