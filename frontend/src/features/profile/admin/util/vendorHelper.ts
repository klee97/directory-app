import { BackendVendorInsert, VendorTag } from "@/types/vendor";
import axios from 'axios';
import { getDefaultBio } from "../../common/utils/bio";
import { getDisplayNameWithoutType } from "@/lib/location/locationNames";

export type VendorDataPrepareMode = 'create' | 'update';

interface PrepareVendorDataOptions {
  mode: VendorDataPrepareMode;
  existingData?: Partial<BackendVendorInsert> & {
    tags?: VendorTag[];
  };
}

// Fields that should NOT be copied directly (they're computed/derived)
const COMPUTED_FIELDS = new Set<string>([
  'slug',
  'gis',
  'gis_computed'
]);

// Fields that are on related tables and not part of vendor insert/update
const RELATED_FIELDS = new Set<string>([
  'tags',
  'testimonials',
  'images'
]);

// Input type for the preparation function
export interface VendorDataInput {
  business_name?: string | null;
  website?: string | null;
  email?: string | null;
  ig_handle?: string | null;
  region?: string | null;
  travels_world_wide?: boolean | null;
  google_maps_place?: string | null;
  bridal_hair_price?: number | null;
  bridal_makeup_price?: number | null;
  "bridal_hair_&_makeup_price"?: number | null;
  bridesmaid_hair_price?: number | null;
  bridesmaid_makeup_price?: number | null;
  "bridesmaid_hair_&_makeup_price"?: number | null;
  lists_prices?: boolean | null;
  cover_image?: string | null;
  // Use separate lat/lon fields
  latitude?: number | null;
  longitude?: number | null;
  tags?: VendorTag[] | null;
}

// Prepare vendor insertion data
export async function prepareVendorData(
  vendor: VendorDataInput,
  options: PrepareVendorDataOptions
): Promise<BackendVendorInsert> {
  const updates: Partial<BackendVendorInsert> = {};
  const { mode, existingData } = options;

  // Handle slug generation
  if (mode === 'create' && vendor.business_name) {
    updates.slug = generateSlug(vendor.business_name);
  }

  // todo: allow slug updates on business_name change?

  if (vendor.latitude !== undefined && vendor.latitude !== null &&
    vendor.longitude !== undefined && vendor.longitude !== null) {


    if (isValidCoordinate(vendor.latitude, vendor.longitude)) {
      const coordinatesChanged = mode === 'create' ||
        vendor.latitude !== existingData?.latitude ||
        vendor.longitude !== existingData?.longitude;

      if (coordinatesChanged) {
        // Store lat/lon directly
        updates.latitude = vendor.latitude;
        updates.longitude = vendor.longitude;
        updates.location_coordinates = `${vendor.latitude}, ${vendor.longitude}`;

        // Set gis using PostGIS format
        updates.gis = convertToPostgisPoint(vendor.latitude, vendor.longitude);

        // Geocode to get address
        const { city, state, country } = await convertToAddress(vendor.latitude, vendor.longitude);
        updates.city = city;
        updates.state = state;
        updates.country = country;
        updates.description = getDefaultBio({
          businessName: vendor.business_name ?? existingData?.business_name ?? null,
          tags: vendor.tags ?? existingData?.tags ?? [],
          location: getDisplayNameWithoutType(city, state, country) ?? null
        });
        console.log("Updated description based on coordinates:", updates.description);
      }
    } else {
      console.warn(`Invalid coordinates: lat=${vendor.latitude}, lon=${vendor.longitude}`);
    }
  }

  // Copy all non-computed fields
  for (const [key, value] of Object.entries(vendor)) {
    if (value !== undefined && value !== null && !COMPUTED_FIELDS.has(key) && !RELATED_FIELDS.has(key)) {
      updates[key as keyof BackendVendorInsert] = value;
    }
  }
  return filterUndefinedOrNullValues(updates);
};

const filterUndefinedOrNullValues = (obj: Record<string, unknown>): Record<string, unknown> => {
  return Object.entries(obj)
    .filter(([, value]) => value !== undefined && value !== null)
    .reduce((acc: Record<string, unknown>, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, unknown>);
}

// Generate a slug from the business name
const generateSlug = (business_name: string | null): string | null => {
  if (business_name === null || business_name.trim() === '') {
    return null;
  }

  return business_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export function convertToPostgisPoint(lat: number, lon: number) {
  return `SRID=4326;POINT(${lon} ${lat})`;
}

// convert lat, long to postgis point
export async function convertToAddress(lat: number, lon: number) {
  let city: string | null = null;
  let state: string | null = null;
  let country: string | null = null;

  try {
    // Use OpenStreetMap Nominatim for reverse geocoding
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'jsonv2',
        lat: lat,
        lon: lon
      },
      headers: {
        'User-Agent': 'AsianWeddingMakeup/1.0 (katrina@asianweddingmakeup.com)',
        'Accept': 'application/json'
      }
    });

    const address = response.data.address;

    // Extract location details
    city = address.city || address.town || address.village || null;
    state = address.state || null;
    country = address.country || null;

  } catch (error) {
    console.error('Error in coordinate conversion:', error);
    // Reset values in case of error
    city = null;
    state = null;
    country = null;
  }

  return {
    city,
    state,
    country
  };
}

function isValidCoordinate(lat: number, lon: number): boolean {
  return !isNaN(lat) && !isNaN(lon) &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180;
}