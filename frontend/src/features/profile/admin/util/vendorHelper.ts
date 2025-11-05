import { BackendVendorInsert } from "@/types/vendor";
import axios from 'axios';

export type VendorDataPrepareMode = 'create' | 'update';

interface PrepareVendorDataOptions {
  mode: VendorDataPrepareMode;
  existingData?: Partial<BackendVendorInsert>;
}

// Fields that should NOT be copied directly (they're computed/derived)
const COMPUTED_FIELDS = new Set<keyof BackendVendorInsert>([
  'slug',
  'gis',
  'city',
  'state',
  'country',
  'location_coordinates', // We handle this specially
]);

// Prepare vendor insertion data
export async function prepareVendorData(
  vendor: BackendVendorInsert,
  options: PrepareVendorDataOptions
): Promise<BackendVendorInsert> {
  const updates: Partial<BackendVendorInsert> = {};
  const { mode, existingData } = options;

  // Handle slug generation
  if (mode === 'create' && vendor.business_name) {
    updates.slug = generateSlug(vendor.business_name);
  } else if (mode === 'update' && vendor.business_name && vendor.business_name !== existingData?.business_name) {
    updates.slug = generateSlug(vendor.business_name);
  }

  const parsedCoordinates = extractCoordinates(vendor.location_coordinates);
  let lat, lon;
  let city, state, country;
  let gis;
  if (parsedCoordinates) {
    lat = parsedCoordinates.lat;
    lon = parsedCoordinates.lon;
    gis = convertToPostgisPoint(lat, lon);
    ({ city, state, country } = await convertToAddress(lat, lon)); // todo: test assignment
  }

  return filterUndefinedOrNullValues({
    // Required field
    bridal_hair_price: vendor.bridal_hair_price,
    bridal_makeup_price: vendor.bridal_makeup_price,
    "bridal_hair_&_makeup_price": vendor["bridal_hair_&_makeup_price"],
    bridesmaid_hair_price: vendor.bridesmaid_hair_price,
    bridesmaid_makeup_price: vendor.bridesmaid_makeup_price,
    "bridesmaid_hair_&_makeup_price": vendor["bridesmaid_hair_&_makeup_price"],
    business_name: vendor.business_name,
    city: city,
    country: country,
    cover_image: vendor.cover_image,
    email: vendor.email,
    gis: gis,
    google_maps_place: vendor.google_maps_place,
    ig_handle: vendor.ig_handle,
    lists_prices: vendor.lists_prices,
    location_coordinates: vendor.location_coordinates,
    // metro_id: null,
    // metro_region_id: null,
    region: vendor.region,
    slug: slug,
    state: state,
    // state_id: null,
    travels_world_wide: vendor.travels_world_wide,
    website: vendor.website,
  });
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

function extractCoordinates(coordInput: string | null | undefined) {
  if (!coordInput) {
    console.warn('Could not extract coordinates for input: ' + coordInput);
    return null;
  }

  let lat: number, lon: number;

  // Split and convert coordinates
  [lat, lon] = coordInput.split(',').map(coord => parseFloat(coord.trim()));

  // Validate coordinates
  if (isNaN(lat) || isNaN(lon)) {
    console.warn('Invalid coordinate format: ' + coordInput);
    return null;
  }
  return { lat, lon }
}