import { LocationResult } from "@/types/location";

const roundCoord = (coord: number) => Number(coord.toFixed(4));

export const serializeLocation = (location: LocationResult) => {
  if (location.lat == null || location.lon == null) {
    return null;
  }
  return {
    lat: roundCoord(location.lat),
    lon: roundCoord(location.lon),
  };
};

export const parseLatLonFromParams = ({ lat, lon }: { lat: string | null | undefined; lon: string | null | undefined }) => {
  const latNum = parseFloat(lat ?? "");
  const lonNum = parseFloat(lon ?? "");
  if (isFinite(latNum) && isFinite(lonNum)) {
    return { lat: latNum, lon: lonNum };
  }
  return null;
};