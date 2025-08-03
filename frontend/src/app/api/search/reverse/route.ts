import { createGeocodeKey } from '@/lib/location/reverseGeocode';
import { fetchPhotonResult } from '@/lib/location/photonUtils';
import { rawReversePhotonFetch } from '@/lib/location/reverseGeocode';
import { LocationResult } from '@/types/location';
import { LRUCache } from 'lru-cache';
import { NextResponse } from 'next/server';

const reverseGeocodeCache = new LRUCache<string, { location: LocationResult, success: boolean }>({
  max: 100,
  ttl: 1000 * 60 * 60 * 24, // 24 hours for successful results
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 });
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  const geocodeKey = createGeocodeKey(latNum, lonNum);

  // Check cache first
  const cached = reverseGeocodeCache.get(geocodeKey);
  if (cached) {
    return NextResponse.json(cached.location);
  }

  try {
    const location = await fetchPhotonResult(() => rawReversePhotonFetch(latNum, lonNum));

    if (location) {
      reverseGeocodeCache.set(geocodeKey, { location, success: true });
      console.debug(`Reverse geocode success for (${lat}, ${lon}):`, location);
      return NextResponse.json(location);
    } else {
      console.warn(`Reverse geocode found no results for (${lat}, ${lon})`);
      return NextResponse.json({ error: 'No results found' }, { status: 404 });
    }
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    console.warn(`Reverse search failed for "${lat}, ${lon}":`, errorMessage);
    return NextResponse.json({ error: 'Failed to resolve location' }, { status: 500 });
  }
}
