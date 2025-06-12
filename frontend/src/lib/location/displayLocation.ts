import { Vendor } from "@/types/vendor";

export const getLocationString = (vendor: Vendor) => {
  if (vendor.city && vendor.state) {
    return `${vendor.city}, ${vendor.state}`;
  }
  if (vendor.city) {
    return vendor.city;
  }
  if (vendor.state) {
    return vendor.state;
  }
  if (vendor.metro) {
    return vendor.metro;
  }
  if (vendor.metro_region) {
    return vendor.metro_region;
  }
  if (vendor.region) {
    return vendor.region;
  }
  return null;
};