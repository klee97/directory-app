import { supabase } from '@/lib/api-client';
import { ActiveLocation, LocationResult, SEARCH_RADIUS_MILES_DEFAULT } from '@/types/location';
import { VendorByDistance } from '@/types/vendor';
import { generateLocationSlug, getDisplayName } from './locationNames';


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
      .single();

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
     * Get location data with vendors for static generation
     */
  async getLocationWithVendors(location: ActiveLocation): Promise<{
    location: ActiveLocation;
    vendors: VendorByDistance[];
    slug: string;
  }> {
    const vendors = await this.getVendorsForLocation(
      location.lat,
      location.lon,
      SEARCH_RADIUS_MILES_DEFAULT
    );

    const slug = generateLocationSlug(
      location.city,
      location.state,
      location.country
    );

    return {
      location,
      vendors,
      slug
    };
  }

  async getActiveLocations() {
    try {
      console.debug("Fetching active locations");
      const { data, error } = await supabase
        .rpc("get_active_locations");

      if (error) {
        console.error('Error fetching active locations:', error);
      }
      if (data === null) {
        return [];
      }
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch card data.');
    }
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
