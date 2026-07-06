import { useState, useEffect, useRef } from 'react';
import { LocationResult } from '@/types/location';
import { parseLatLonFromParams } from '@/lib/location/serializer';
import { createGeocodeKey } from '@/features/directory/components/reverseGeocodeCache';
import reverseGeocodeCache from '@/features/directory/components/reverseGeocodeCache';
import { LATITUDE_PARAM, LONGITUDE_PARAM } from '@/lib/constants';
import { useURLFiltersContext } from '@/contexts/URLFiltersContext';

export default function useResolvedLocation({
    preselectedLocation,
    immediateLocation
}: {
    preselectedLocation: LocationResult | null,
    immediateLocation?: LocationResult | null,
}): LocationResult | null {
    console.debug('useResolvedLocation: Hook initialized with preselectedLocation:', preselectedLocation, 'immediateLocation:', immediateLocation);
    const [resolvedFromFetch, setResolvedFromFetch] = useState<LocationResult | null>(null);
    const lastCoordsRef = useRef<string | null>(null);
    const isResolvingRef = useRef<boolean>(false);

    const { getParam } = useURLFiltersContext();
    const lat = getParam(LATITUDE_PARAM);
    const lon = getParam(LONGITUDE_PARAM);

    const coords = parseLatLonFromParams({ lat, lon });
    const coordsKey = coords ? createGeocodeKey(coords.lat, coords.lon) : null;
    const cached = coordsKey ? reverseGeocodeCache.get(coordsKey) : null;

    // Calculated during rendering — covers every case that doesn't require a network call
    const syncLocation =
        immediateLocation !== undefined ? immediateLocation
            : immediateLocation === null ? null
                : preselectedLocation ? preselectedLocation
                    : coords === null ? null
                        : cached ? cached
                            : undefined; // undefined = "need to fetch, no synchronous answer available"

    // Only fetch/resolve from coords when there's no synchronous answer
    useEffect(() => {
        if (syncLocation !== undefined) return; // handled synchronously above
        if (!coords || !coordsKey) return;

        if (lastCoordsRef.current === coordsKey) return;
        if (isResolvingRef.current) return;

        isResolvingRef.current = true;

        (async () => {
            try {
                const res = await fetch(`/api/search/reverse?lat=${coords.lat}&lon=${coords.lon}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: LocationResult | null = await res.json();
                if (data) {
                    reverseGeocodeCache.set(coordsKey, data);
                    setResolvedFromFetch(data); // setState inside an async callback — legitimate
                    lastCoordsRef.current = coordsKey;
                }
            } catch (error) {
                console.error('Error resolving location:', error);
            } finally {
                isResolvingRef.current = false;
            }
        })();
    }, [coords, coordsKey, syncLocation]);

    return syncLocation !== undefined ? syncLocation : resolvedFromFetch;
}