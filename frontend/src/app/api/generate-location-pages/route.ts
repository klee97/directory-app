import { NextResponse } from 'next/server';
import { LocationPageGenerator } from '@/lib/location/LocationPageGenerator';
import { ActiveLocation } from '@/types/location';

export async function POST() {
  try {
    const generator = new LocationPageGenerator();
    const locations = await generator.getActiveLocations();
    
    const locationData = await Promise.all(
      locations.map((location: ActiveLocation) => generator.getLocationWithVendors(location))
    );

    return NextResponse.json({
      success: true,
      count: locationData.length,
      locations: locationData
    });
  } catch (error) {
    console.error('Error generating location pages:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate location pages' 
      },
      { status: 500 }
    );
  }
}