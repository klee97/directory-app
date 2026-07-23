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
    const isResolvingRef = useRef<boolean>(false);

    const { getParam } = useURLFiltersContext();
    const lat = getParam(LATITUDE_PARAM);
    const lon = getParam(LONGITUDE_PARAM);

    const coords = parseLatLonFromParams({ lat, lon });
    const coordsKey = coords ? createGeocodeKey(coords.lat, coords.lon) : null;
    const cached = coordsKey ? reverseGeocodeCache.get(coordsKey) : null;

    let syncLocation: LocationResult | null | undefined;
    if (immediateLocation !== undefined) {
        syncLocation = immediateLocation;
    } else if (preselectedLocation) {
        syncLocation = preselectedLocation;
    } else if (coords === null) {
        syncLocation = null;
    } else if (cached) {
        syncLocation = cached;
    } else {
        syncLocation = undefined;
    }

    useEffect(() => {
        if (syncLocation !== undefined) return;
        if (!coords || !coordsKey) return;

        if (lastCoordsRef.current === coordsKey) return;
        if (isResolvingRef.current) return;

        isResolvingRef.current = true;

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
                isResolvingRef.current = false;
            }
        })();
    }, [coords, coordsKey, syncLocation]);

    if (syncLocation !== undefined) {
        return syncLocation;
    }
    if (resolvedFromFetch?.key === coordsKey) {
        return resolvedFromFetch.location; // fetch settled — success, not-found, or error; never undefined here
    }
    return undefined; // still resolving
}