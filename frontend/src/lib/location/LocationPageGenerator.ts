import { supabase } from '@/lib/api-client';
import { LOCATION_TYPE_CITY, LOCATION_TYPE_COUNTRY, LOCATION_TYPE_STATE, LocationResult, SEARCH_RADIUS_MILES_DEFAULT } from '@/types/location';
import { transformBackendVendorToFrontend, VendorByDistance } from '@/types/vendor';
import { getDisplayName } from './locationNames';


export class LocationPageGenerator {
  private _cachedSlugs: Set<string> | null = null;


  async getValidLocationSlugs(): Promise<Set<string>> {
    if (this._cachedSlugs) return this._cachedSlugs;
    const { data, error } = await supabase.from('location_slugs').select('slug');
    if (error || !data) return new Set();
    this._cachedSlugs = new Set(data.map((row: { slug: string }) => row.slug));
    return this._cachedSlugs;
  }

  getSlugFromLocation(location: LocationResult): string {
    if (location.type === LOCATION_TYPE_CITY && location.address?.city && location.address?.state && location.address?.country) {
      return `${location.address.city}-${location.address.state}-${location.address.country}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    } else if (location.type === LOCATION_TYPE_STATE && !!location.address?.state && !!location.address?.country) {
      return `${location.address.state}-${location.address.country}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    } else if (location.type === LOCATION_TYPE_COUNTRY && !!location.address?.country) {
      return `${location.address.country}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    return '';
  }

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
    const display_name = getDisplayName(data.city, data.state, data.country, data.type);

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
    const { data, error } = await supabase.rpc('get_vendors_by_location_with_distinct_tags_and_media', {
      lat,
      lon,
      radius_miles: radiusMiles,
      limit_results: limitResults
    });

    if (error) {
      console.error('Error fetching vendors for location:', error);
      return [];
    }

    return data.map(transformBackendVendorToFrontend) || [];
  }
}
