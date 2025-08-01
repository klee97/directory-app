import { parseLatLonFromParams } from "@/lib/location/serializer";
import { LocationResult } from "@/types/location";
import { useEffect, useRef, useState } from "react";

const reverseGeocodeCache = new Map<string, LocationResult>();


export default function useResolvedLocation({
    preselectedLocation,
    searchParams,
}: {
    preselectedLocation: LocationResult | null,
    searchParams: URLSearchParams,
}): LocationResult | null {
    const [resolvedLocation, setResolvedLocation] = useState<LocationResult | null>(preselectedLocation);
    const lastCoordsRef = useRef<string | null>(null);

    useEffect(() => {
        if (preselectedLocation && lastCoordsRef.current === null) {
            setResolvedLocation(preselectedLocation);
            lastCoordsRef.current = 'preselected';
            return;
        }

        const coords = parseLatLonFromParams(searchParams);
        
        // If no coordinates, clear the location and reset
        if (!coords) {
            setResolvedLocation(null);
            lastCoordsRef.current = null;
            return;
        }
        
        // Create a key for these coordinates
        const coordsKey = `${coords.lat.toFixed(4)},${coords.lon.toFixed(4)}`;
        
        // If we've already resolved these exact coordinates, don't resolve again
        if (lastCoordsRef.current === coordsKey) return;

        const cached = reverseGeocodeCache.get(coordsKey);
        if (cached) {
            setResolvedLocation(cached);
            lastCoordsRef.current = coordsKey;
            return;
        }

        const resolve = async () => {
            const res = await fetch(`/api/search/reverse?lat=${coords.lat}&lon=${coords.lon}`);
            const data: LocationResult | null = await res.json();
            if (data) {
                reverseGeocodeCache.set(coordsKey, data);
                setResolvedLocation(data);
                lastCoordsRef.current = coordsKey;
            }
        };

        resolve();
    }, [searchParams, preselectedLocation]);

    return resolvedLocation;
}