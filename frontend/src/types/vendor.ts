import type { Database } from "@/types/supabase";
import { BackendVendorTag } from "./tag";
import { isDevOrPreview } from "@/lib/env/env";
import { getMigratedUrl, processVendorImages } from "@/lib/directory/images";

export const IMAGE_PREFIX = 'https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/';
export const R2_IMAGE_PREFIX = 'https://images.asianweddingmakeup.com/';

export const PREFIXES: Set<string> = new Set<string>([IMAGE_PREFIX, R2_IMAGE_PREFIX]);

export type BackendVendor = Database['public']['Tables']['vendors']['Row']
  & {
    usmetro: { display_name: string } | null // Metro name (can be null if no metro region found)
    regions: { name: string } | null // Metro region name (can be null if no metro region found)
    usstates: { name: string } | null      // State name (can be null if no state found)
    vendor_testimonials: BackendVendorTestimonial[] | null
    tags: BackendVendorTag[] | null
    distance_miles?: number | null // Optional distance in miles for sorting
    vendor_media: BackendVendorMedia[] | null // Array of image URLs for the vendor
  };
;

export type BackendVendorInsert = Database['public']['Tables']['vendors']['Insert'];
export type BackendVendorRecommendationInsert = Database['public']['Tables']['vendor_recommendations']['Insert'];
export type BackendVendorTestimonial = Database['public']['Tables']['vendor_testimonials']['Row']
export type BackendVendorMedia = Database['public']['Tables']['vendor_media']['Row'];
export type VendorId = string;

export type VendorTestimonial = Pick<BackendVendorTestimonial, 'id'
  | 'vendor_id'
  | 'review'
  | 'author'
>

export type VendorTag = Pick<BackendVendorTag, 'id'
  | 'display_name'
  | 'type'
  | 'is_visible'
  | 'style'
  | 'name'
>

export type VendorMedia = Pick<BackendVendorMedia, 'id'
  | 'media_url'
>

export type Vendor = Pick<BackendVendor, 'id'
  | 'business_name'
  | 'email'
  | 'website'
  | 'region'
  | 'city'
  | 'state'
  | 'country'
  | 'travels_world_wide'
  | 'slug'
  | 'cover_image'
  | 'bridal_hair_price'
  | 'bridal_makeup_price'
  | 'bridesmaid_hair_price'
  | 'bridesmaid_makeup_price'
  | 'gis'
  | 'google_maps_place'
  | 'profile_image'
  | 'description'
> & {
  'bridal_hair_makeup_price': number | null,
  'bridesmaid_hair_makeup_price': number | null,
  'metro': string | null,
  'metro_region': string | null,
  'state': string | null,
  'instagram': string | null,
  'google_maps_place': string | null,
  'testimonials': VendorTestimonial[],
  'tags': VendorTag[],
  'latitude': number | null,
  'longitude': number | null,
  'images': string[],
  'is_premium': boolean,
};

export type VendorUpdate = Partial<Pick<BackendVendor, 
  | 'business_name'
  | 'website'
  | 'email'
  | 'region'
  | 'lists_prices'
  | 'description'
  | 'location_coordinates'
  | 'travels_world_wide'
  | 'ig_handle'
  | 'bridal_hair_price'
  | 'bridal_makeup_price'
  | 'bridal_hair_&_makeup_price'
  | 'bridesmaid_hair_price'
  | 'bridesmaid_makeup_price'
  | 'bridesmaid_hair_&_makeup_price'
  | 'google_maps_place'
  | 'cover_image'
>> & {
  tags?: VendorTag[];
};

export function transformVendorUpdateToBackend(
  update: VendorUpdate
): BackendVendorInsert {
  // Remove null values (they mean "no change")
  const cleanedUpdate = Object.fromEntries(
    Object.entries(update).filter(([_, v]) => v !== null)
  ) as Partial<BackendVendorInsert>;
  
  return cleanedUpdate as BackendVendorInsert;
}

export function transformBackendVendorToFrontend(vendor: BackendVendor): VendorByDistance {
  console.debug(`Transforming vendor: ${vendor.business_name} (ID: ${vendor.id})`);
  const coordinates = parseCoordinates(vendor.location_coordinates);
  const procesedImages = processVendorImages(vendor, { preferR2: true, fallbackToSupabase: true });
  console.debug(`Processed ${procesedImages.length} images for vendor ${vendor.business_name}`);
  const images = procesedImages.map(img => img.media_url).filter((url): url is string => typeof url === 'string');
  const coverImage = getMigratedUrl(vendor.cover_image);

  const isPremiumVendor = (vendor.vendor_type === 'PREMIUM' && process.env.NEXT_PUBLIC_FEATURE_PREMIUM_ENABLED === 'true')
    || (vendor.vendor_type === 'TRIAL' && isDevOrPreview());

  return {
    id: vendor.id,
    is_premium: isPremiumVendor,
    business_name: vendor.business_name,
    description: vendor.description,
    email: vendor.email,
    website: vendor.website,
    instagram: (vendor.ig_handle ?? '').replace('@', ''),
    google_maps_place: vendor.google_maps_place,
    latitude: coordinates?.latitude ?? null,
    longitude: coordinates?.longitude ?? null,
    region: vendor.region,
    city: vendor.city,
    state: vendor.state,
    country: vendor.country,
    travels_world_wide: vendor.travels_world_wide,
    slug: vendor.slug,
    bridal_hair_makeup_price: vendor['bridal_hair_&_makeup_price'],
    bridal_hair_price: vendor.bridal_hair_price,
    bridal_makeup_price: vendor.bridal_makeup_price,
    bridesmaid_hair_makeup_price: vendor['bridesmaid_hair_&_makeup_price'],
    bridesmaid_makeup_price: vendor.bridesmaid_makeup_price,
    bridesmaid_hair_price: vendor.bridesmaid_hair_price,
    gis: vendor.gis,
    metro: vendor.usmetro?.display_name ?? null, // Safely access metro region name
    metro_region: vendor.regions?.name ?? null, // Safely access region name
    testimonials: vendor.vendor_testimonials ?? [],
    tags: vendor.tags ?? [],
    distance_miles: vendor.distance_miles ?? null,
    images: images ?? [],
    profile_image: vendor.profile_image
      && (vendor.profile_image.startsWith(IMAGE_PREFIX) || vendor.profile_image.startsWith(R2_IMAGE_PREFIX))
      ? vendor.profile_image : null,
    cover_image: coverImage
      && (coverImage.startsWith(IMAGE_PREFIX) || coverImage.startsWith(R2_IMAGE_PREFIX))
      ? coverImage : null,
  }
};

export type VendorByDistance = Vendor & {
  distance_miles?: number | null
};

function parseCoordinates(coordinateString: string | null): { latitude: number; longitude: number } | null {
  if (!coordinateString) return null;

  try {
    const parts = coordinateString.split(',');
    if (parts.length !== 2) return null;

    const latitude = parseFloat(parts[0].trim());
    const longitude = parseFloat(parts[1].trim());

    // Validate ranges
    if (isNaN(latitude) || isNaN(longitude) ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180) {
      return null;
    }

    return { latitude, longitude };
  } catch (error) {
    console.warn('Failed to parse coordinates:', coordinateString, error);
    return null;
  }
}