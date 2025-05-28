import { BackendVendorInsert } from "@/types/vendor";
import axios from 'axios';

// Prepare vendor insertion data
export async function prepareVendorInsertData(vendor: BackendVendorInsert): Promise<BackendVendorInsert> {
  const slug = generateSlug(vendor.business_name ?? null);
  const { gis, city, state, country } = await convertToPostgisPoint(vendor.location_coordinates ?? null);

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
    // cover_image: null,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const filterUndefinedOrNullValues = (obj: Record<string, any>): Record<string, any> => {
  return Object.entries(obj)
    .filter(([, value]) => value !== undefined && value !== null && value.trim !== '')
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
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

// convert lat, long to postgis point
async function convertToPostgisPoint(coordInput: string | null) {
  // Handle null or empty input
  if (!coordInput) {
    return {
      gis: null,
      city: null,
      state: null,
      country: null
    };
  }

  let lat: number, lon: number;
  let gis: string | null = null;
  let city: string | null = null;
  let state: string | null = null;
  let country: string | null = null;

  try {
    // Split and convert coordinates
    [lat, lon] = coordInput.split(',').map(coord => parseFloat(coord.trim()));

    // Validate coordinates
    if (isNaN(lat) || isNaN(lon)) {
      throw new Error('Invalid coordinate format');
    }

    // Create PostGIS point string
    gis = `SRID=4326;POINT(${lon} ${lat})`;

    // Use OpenStreetMap Nominatim for reverse geocoding
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'jsonv2',
        lat: lat,
        lon: lon
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
    gis = null;
    city = null;
    state = null;
    country = null;
  }

  return {
    gis,
    city,
    state,
    country
  };
}