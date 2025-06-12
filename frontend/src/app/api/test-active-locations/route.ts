import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

type Vendor = {
  city: string;
  state: string;
  country: string;
  state_id: string;
  metro_id: string;
  metro_region_id: string;
};

type LocationGroup = {
  city: string;
  state: string;
  country: string;
  state_id: string;
  metro_id: string;
  metro_region_id: string;
  vendor_count: number;
};

export async function GET() {
  try {
    console.log('Testing get_active_locations function...');

    // Attempt to run the stored procedure
    const { data: locations, error: locationsError } = await supabase
      .rpc('get_active_locations', { min_vendor_count: 1 });

    // If RPC fails, use fallback
    if (locationsError) {
      console.error('Function error:', locationsError);
      console.log('Trying raw query as fallback...');

      const { data: rawData, error: rawError } = await supabase
        .from('vendors')
        .select(`
          city,
          state,
          country,
          state_id,
          metro_id,
          metro_region_id
        `)
        .not('city', 'is', null)
        .not('state', 'is', null)
        .not('country', 'is', null)
        .not('gis', 'is', null);

      if (rawError || !rawData) {
        throw new Error(`Raw query failed: ${rawError?.message || 'Unknown error'}`);
      }

      const locationGroups = rawData.reduce<Record<string, LocationGroup>>((acc, vendor) => {
        const typedVendor = vendor as Vendor; // ensure known shape
        const key = `${typedVendor.city}-${typedVendor.state}-${typedVendor.country}`;

        if (!acc[key]) {
          acc[key] = {
            city: typedVendor.city,
            state: typedVendor.state,
            country: typedVendor.country,
            state_id: typedVendor.state_id,
            metro_id: typedVendor.metro_id,
            metro_region_id: typedVendor.metro_region_id,
            vendor_count: 0
          };
        }

        acc[key].vendor_count++;
        return acc;
      }, {});

      const fallbackLocations = Object.values(locationGroups);

      return NextResponse.json({
        success: true,
        message: 'Function failed, used fallback query',
        function_error: locationsError.message,
        count: fallbackLocations.length,
        locations: fallbackLocations.slice(0, 10),
        sample_vendor_data: rawData.slice(0, 3)
      });
    }

    return NextResponse.json({
      success: true,
      count: locations?.length ?? 0,
      locations: locations?.slice(0, 10),
      all_locations: locations
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    );
  }
}