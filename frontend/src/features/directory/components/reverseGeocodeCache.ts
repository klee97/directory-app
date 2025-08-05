import { LocationResult } from "@/types/location";

const reverseGeocodeCache = new Map<string, LocationResult>();


export default reverseGeocodeCache;

export function createGeocodeKey(lat: number, lon: number): string {
    return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}