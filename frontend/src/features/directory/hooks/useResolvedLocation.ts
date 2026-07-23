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
}): LocationResult | null | undefined {
    // undefined = still resolving (loading state)
    // null      = resolution completed but no location found (or lookup failed)
    // LocationResult = resolved successfully
    console.debug('useResolvedLocation: Hook initialized with preselectedLocation:', preselectedLocation, 'immediateLocation:', immediateLocation);
    const [resolvedFromFetch, setResolvedFromFetch] = useState<{
        key: string;
        location: LocationResult | null;
    } | null>(null);
    const lastCoordsRef = useRef<string | null>(null);
    const resolvingKeyRef = useRef<string | null>(null);

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
        syncLocation = undefined;; // no synchronous location available, will need to fetch using effect
    }

    useEffect(() => {
        if (syncLocation !== undefined) return;  // handled synchronously above
        if (!coords || !coordsKey) return;

        if (lastCoordsRef.current === coordsKey) return;
        if (resolvingKeyRef.current === coordsKey) return;

        resolvingKeyRef.current = coordsKey;

        (async () => {
            try {
                const response = await fetchApi<LocationResult>(`/api/search/reverse?lat=${coords.lat}&lon=${coords.lon}`);

                if (!response.ok) {
                    // A 404 (nothing resolvable at these coordinates) is an
                    // expected, terminal outcome — not a transient error.
                    // Settle state so downstream consumers stop waiting,
                    // instead of leaving the hook looking identical to
                    // "still loading" forever.
                    console.warn('No location resolved for coords:', coords, response.error);
                    setResolvedFromFetch({ key: coordsKey, location: null });
                    lastCoordsRef.current = coordsKey;
                    return;
                }

                const data = response.data;
                if (data) {
                    reverseGeocodeCache.set(coordsKey, data);
                }
                setResolvedFromFetch({ key: coordsKey, location: data ?? null });
                lastCoordsRef.current = coordsKey;
            } catch (error) {
                console.error('Error resolving location:', error);
                setResolvedFromFetch({ key: coordsKey, location: null });
                lastCoordsRef.current = coordsKey;
            } finally {
                if (resolvingKeyRef.current === coordsKey) {
                    resolvingKeyRef.current = null;
                }
            }
        })();
    }, [coords, coordsKey, syncLocation]);

    // `resolvedFromFetch` can be stale if coords changed since the last fetch
    // completed — only trust it when its key matches the current coords.
    if (syncLocation !== undefined) {
        return syncLocation;
    }
    if (resolvedFromFetch?.key === coordsKey) {
        return resolvedFromFetch.location; // fetch settled — success, not-found, or error; never undefined here
    }
    return undefined; // still resolving
}