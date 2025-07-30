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

export const parseLatLonFromParams = (params: URLSearchParams) => {
  const lat = parseFloat(params.get("lat") || "");
  const lon = parseFloat(params.get("lon") || "");
  if (isFinite(lat) && isFinite(lon)) {
    return { lat, lon };
  }
  return null;
};
