import type { Database } from "@/types/supabase";


export const IMAGE_PREFIX = 'https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/sign/hmua-cover-photos/';
export type BackendVendor = Database['public']['Tables']['vendors']['Row']
  & {
    usmetro: { display_name: string } | null // Metro name (can be null if no metro region found)
    regions: { name: string } | null // Metro region name (can be null if no metro region found)
    usstates: { name: string } | null      // State name (can be null if no state found)
    vendor_testimonials: BackendVendorTestimonial[] | null
  };
;

export type BackendVendorInsert = Database['public']['Tables']['vendors']['Insert'];
export type BackendVendorRecommendationInsert = Database['public']['Tables']['vendor_recommendations']['Insert'];
export type BackendVendorTestimonial = Database['public']['Tables']['vendor_testimonials']['Row']
export type VendorId = string;

export type VendorTestimonial = Pick<BackendVendorTestimonial, 'id'
  | 'vendor_id'
  | 'review'
  | 'author'
>

export type Vendor = Pick<BackendVendor, 'id'
  | 'business_name'
  | 'email'
  | 'website'
  | 'region'
  | 'travels_world_wide'
  | 'slug'
  | 'cover_image'
  | 'bridal_hair_price'
  | 'bridal_makeup_price'
  | 'bridesmaid_hair_price'
  | 'bridesmaid_makeup_price'
  | 'gis'
  | 'google_maps_place'
> & {
  'bridal_hair_makeup_price': number | null,
  'bridesmaid_hair_makeup_price': number | null,
  'specialties': Set<string>,
  'metro': string | null,
  'metro_region': string | null,
  'state': string | null,
  'instagram': string | null,
  'google_maps_place': string | null,
  'testimonials': VendorTestimonial[]
}

export function transformBackendVendorToFrontend(vendor: BackendVendor): Vendor {
  return {
    id: vendor.id,
    business_name: vendor.business_name,
    email: vendor.email,
    website: vendor.website,
    instagram: `https://instagram.com/${(vendor.ig_handle ?? '').replace('@', '')}`,
    google_maps_place: vendor.google_maps_place,
    region: vendor.region,
    travels_world_wide: vendor.travels_world_wide,
    slug: vendor.slug,
    cover_image: vendor.cover_image && vendor.cover_image.startsWith(IMAGE_PREFIX) ? vendor.cover_image : null,
    bridal_hair_makeup_price: vendor['bridal_hair_&_makeup_price'],
    bridal_hair_price: vendor.bridal_hair_price,
    bridal_makeup_price: vendor.bridal_makeup_price,
    bridesmaid_hair_makeup_price: vendor['bridesmaid_hair_&_makeup_price'],
    bridesmaid_makeup_price: vendor.bridesmaid_makeup_price,
    bridesmaid_hair_price: vendor.bridesmaid_hair_price,
    gis: vendor.gis,
    specialties: new Set((vendor.specialization ?? '').split(',').map(s => s.trim())),
    metro: vendor.usmetro?.display_name ?? null, // Safely access metro region name
    metro_region: vendor.regions?.name ?? null, // Safely access region name
    state: vendor.usstates?.name ?? null, // Safely access state name
    testimonials: vendor.vendor_testimonials ?? [],
  };
}

