import { useState, useEffect, useRef } from 'react';
import { LocationResult } from '@/types/location';
import { parseLatLonFromParams } from '@/lib/location/serializer';
import { createGeocodeKey } from '@/features/directory/components/reverseGeocodeCache';
import reverseGeocodeCache from '@/features/directory/components/reverseGeocodeCache';
import { LATITUDE_PARAM, LONGITUDE_PARAM } from '@/lib/constants';
import { useURLFiltersContext } from '@/contexts/URLFiltersContext';

export default function useResolvedLocation({
    preselectedLocation,
    immediateLocation,
    clearImmediateLocation
}: {
    preselectedLocation: LocationResult | null,
    immediateLocation?: LocationResult | null,
    clearImmediateLocation?: () => void
}): LocationResult | null {
    console.debug('useResolvedLocation: Hook initialized with preselectedLocation:', preselectedLocation, 'immediateLocation:', immediateLocation);
    const [resolvedLocation, setResolvedLocation] = useState<LocationResult | null>(preselectedLocation);
    const lastCoordsRef = useRef<string | null>(null);
    const isResolvingRef = useRef<boolean>(false);

    const { getParam } = useURLFiltersContext();
    const lat = getParam(LATITUDE_PARAM);
    const lon = getParam(LONGITUDE_PARAM);

    useEffect(() => {
        // Handle immediate location (from user selection) - highest priority
        if (immediateLocation) {
            setResolvedLocation(immediateLocation);
            // Update lastCoordsRef to prevent redundant resolution
            if (immediateLocation.lat && immediateLocation.lon) {
                const coordsKey = createGeocodeKey(immediateLocation.lat, immediateLocation.lon);
                lastCoordsRef.current = coordsKey;
            }
            return;
        }

        // Handle preselected location
        if (preselectedLocation && lastCoordsRef.current === null) {
            setResolvedLocation(preselectedLocation);
            lastCoordsRef.current = 'preselected';
            return;
        }

        const coords = parseLatLonFromParams({
            lat,
            lon
        });

        // If no coordinates, clear the location and reset
        if (!coords) {
            setResolvedLocation(null);
            lastCoordsRef.current = null;
            isResolvingRef.current = false;
            return;
        }

        const coordsKey = createGeocodeKey(coords.lat, coords.lon);

        // If we've already resolved these exact coordinates, don't resolve again
        if (lastCoordsRef.current === coordsKey) {
            return;
        }

        // Check cache first
        const cached = reverseGeocodeCache.get(coordsKey);
        if (cached) {
            console.debug('useResolvedLocation: Using cached location for', coordsKey);
            setResolvedLocation(cached);
            lastCoordsRef.current = coordsKey;
            return;
        }

        // Prevent concurrent requests for the same coordinates
        if (isResolvingRef.current) {
            console.debug('useResolvedLocation: Already resolving, skipping');
            return;
        }

        console.debug('useResolvedLocation: Using reverse API to fetch location for', coordsKey);
        isResolvingRef.current = true;

        const resolve = async () => {
            try {
                const res = await fetch(`/api/search/reverse?lat=${coords.lat}&lon=${coords.lon}`);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data: LocationResult | null = await res.json();
                if (data) {
                    reverseGeocodeCache.set(coordsKey, data);
                    setResolvedLocation(data);
                    lastCoordsRef.current = coordsKey;
                }
            } catch (error) {
                console.error('Error resolving location:', error);
                // Keep the previous location on error
            } finally {
                isResolvingRef.current = false;
            }
        };

        resolve();
    }, [lat, lon, preselectedLocation, immediateLocation, clearImmediateLocation]);

    return resolvedLocation;
}