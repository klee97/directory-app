import { useState, useEffect, useRef } from 'react';
import { LocationResult } from '@/types/location';
import { parseLatLonFromParams } from '@/lib/location/serializer';
import { createGeocodeKey } from '@/features/directory/components/reverseGeocodeCache';
import reverseGeocodeCache from '@/features/directory/components/reverseGeocodeCache';
import { LATITUDE_PARAM, LONGITUDE_PARAM } from '@/lib/constants';
import { useURLFiltersContext } from '@/contexts/URLFiltersContext';
import { fetchApi } from '@/lib/api/client';

export default function useResolvedLocation({
    preselectedLocation,
    immediateLocation
}: {
    preselectedLocation: LocationResult | null,
    // undefined = not set (fall through to URL coords)
    // null = explicitly cleared,
    // LocationResult = user just picked one
    immediateLocation?: LocationResult | null,
}): LocationResult | null {
    console.debug('useResolvedLocation: Hook initialized with preselectedLocation:', preselectedLocation, 'immediateLocation:', immediateLocation);
    const [resolvedFromFetch, setResolvedFromFetch] = useState<{
        key: string;
        location: LocationResult | null;
    } | null>(null);
    const lastCoordsRef = useRef<string | null>(null);
    const isResolvingRef = useRef<boolean>(false);

    const { getParam } = useURLFiltersContext();
    const lat = getParam(LATITUDE_PARAM);
    const lon = getParam(LONGITUDE_PARAM);

    const coords = parseLatLonFromParams({ lat, lon });
    const coordsKey = coords ? createGeocodeKey(coords.lat, coords.lon) : null;
    const cached = coordsKey ? reverseGeocodeCache.get(coordsKey) : null;

    // Handle location that can be calculated during rendering — covers every case that doesn't require a network call
    // 
    // Priority: immediateLocation (incl. explicit null) > preselectedLocation > cached reverse-geocode result > "need to fetch" (undefined).
    let syncLocation: LocationResult | null | undefined;
    if (immediateLocation !== undefined) {
        syncLocation = immediateLocation; // covers both a real selection and explicit null
    } else if (preselectedLocation) {
        syncLocation = preselectedLocation;
    } else if (coords === null) {
        syncLocation = null;
    } else if (cached) {
        syncLocation = cached;
    } else {
        syncLocation = undefined; // no synchronous location available, will need to fetch using effect
    }

    // Only fetch/resolve from coords when there's no synchronous answer
    useEffect(() => {
        if (syncLocation !== undefined) return; // handled synchronously above
        if (!coords || !coordsKey) return;

        if (lastCoordsRef.current === coordsKey) return;
        if (isResolvingRef.current) return;

        isResolvingRef.current = true;

        (async () => {
            try {
                const response = await fetchApi<LocationResult>(`/api/search/reverse?lat=${coords.lat}&lon=${coords.lon}`);
                if (!response.ok) {
                    throw new Error(response.error || 'Failed to resolve location');
                }

                const data = response.data;
                if (data) {
                    reverseGeocodeCache.set(coordsKey, data);
                }
                setResolvedFromFetch({ key: coordsKey, location: data ?? null });
                lastCoordsRef.current = coordsKey;
            } catch (error) {
                console.error('Error resolving location:', error);
            } finally {
                isResolvingRef.current = false;
            }
        })();
    }, [coords, coordsKey, syncLocation]);

    // `resolvedFromFetch` can be stale if coords changed since the last fetch
    // completed — only trust it when its key matches the current coords.
    return syncLocation !== undefined
        ? syncLocation
        : resolvedFromFetch?.key === coordsKey
            ? resolvedFromFetch.location
            : null;
}