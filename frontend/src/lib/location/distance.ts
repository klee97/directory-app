import { Vendor, VendorByDistance } from "@/types/vendor";

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function annotateAndSortByDistance(
  vendors: Vendor[],
  target: { lat: number | undefined | null; lon: number | undefined | null }
): VendorByDistance[] {
  if (!target || !target.lat || !target.lon) {
    return vendors.map((v): VendorByDistance => ({ ...v, distance_miles: null }));
  }

  const selectedLat: number = target.lat;
  const selectedLon: number = target.lon;


  const withDistance = vendors.map((v): VendorByDistance => ({
    ...v,
    distance_miles:
      v.latitude !== null && v.longitude !== null
        ? haversineMiles(selectedLat, selectedLon, v.latitude, v.longitude)
        : null,
  }));

  withDistance.sort((a, b) => {
    if (a.distance_miles === null && b.distance_miles === null) return 0;
    if (a.distance_miles === null) return 1;
    if (b.distance_miles === null) return -1;
    return (a.distance_miles as number) - (b.distance_miles as number);
  });

  return withDistance;
}