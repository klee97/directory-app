import { NextRequest, NextResponse } from 'next/server';
import { serverLocationCache } from '@/lib/location/ServerLocationCache';
import { LocationResult } from '@/types/location';
import { resolveLocationFromDisplayName } from '@/lib/location/geocode';

export async function GET(request: NextRequest) {
  const displayName = new URL(request.url).searchParams.get("q")?.trim() || "";

  if (!displayName) {
    return NextResponse.json({ error: "Display name required" }, { status: 400 });
  }

  const encodedName = encodeURIComponent(displayName);
  try {
    // Check cache first
    const cached = serverLocationCache.get(encodedName);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Geocode if not in cache
    const geocodedLocationResult: LocationResult[] = await resolveLocationFromDisplayName(encodedName);
    
    if (!geocodedLocationResult || geocodedLocationResult.length < 1) {
      throw new Error("Geocoding returned no valid location");
    }

    const geocodedLocation = geocodedLocationResult[0];
    // Cache the result
    serverLocationCache.set(displayName, geocodedLocation);
    
    return NextResponse.json(geocodedLocation);
    
  } catch (error) {
    console.error('Geocoding failed for:', displayName, error);
    
    // Return minimal location object as fallback
    const fallback: LocationResult = { 
      display_name: displayName,
      type: 'unknown'
    };
    
    return NextResponse.json(fallback);
  }
}