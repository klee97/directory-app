import { LocationResult } from "@/types/location";

let lastResolvedLocation: LocationResult | null = null;

export function setLastResolvedLocation(loc: LocationResult) {
  lastResolvedLocation = loc;
}

export function getLastResolvedLocation(): LocationResult | null {
  return lastResolvedLocation;
}
