import { supabase } from '@/lib/api-client';
import { LocationResult, SEARCH_RADIUS_MILES_DEFAULT } from '@/types/location';
import { VendorByDistance } from '@/types/vendor';
import { getDisplayName } from './locationNames';


export class LocationPageGenerator {
  async getLocationBySlug(slug: string): Promise<LocationResult | null> {
    const { data, error } = await supabase
      .from('location_slugs')
      .select(`
      city,
      state,
      country,
      lat,
      lon,
      type
    `)
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      console.error(`Location not found for slug: ${slug}`, error);
      return null;
    }
    const display_name = getDisplayName(null, data.city, data.state, data.country, data.type);

    return {
      display_name,
      lat: data.lat,
      lon: data.lon,
      type: data.type,
      address: {
        city: data.city,
        state: data.state,
        country: data.country,
      },
    };
  }

  /**
   * Get vendors for a specific location using the existing search function
   */
  async getVendorsForLocation(
    lat: number,
    lon: number,
    radiusMiles: number = SEARCH_RADIUS_MILES_DEFAULT,
    limitResults: number = 100
  ): Promise<VendorByDistance[]> {
    const { data, error } = await supabase.rpc('get_vendors_by_distance', {
      lat,
      lon,
      radius_miles: radiusMiles,
      limit_results: limitResults
    });

    if (error) {
      console.error('Error fetching vendors for location:', error);
      return [];
    }

    return data || [];
  }
}
