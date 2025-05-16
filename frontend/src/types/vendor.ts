import type { Database } from "@/types/supabase";


export const IMAGE_PREFIX = 'https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/sign/hmua-cover-photos/';
export type BackendVendor = Database['public']['Tables']['vendors']['Row']
  & {
    usmetro: { display_name: string } | null // Metro name (can be null if no metro region found)
    regions: { name: string } | null // Metro region name (can be null if no metro region found)
    usstates: { name: string } | null      // State name (can be null if no state found)
    vendor_testimonials: BackendVendorTestimonial[] | null
    tags: BackendVendorTag[] | null
  };
;

export type BackendVendorInsert = Database['public']['Tables']['vendors']['Insert'];
export type BackendVendorRecommendationInsert = Database['public']['Tables']['vendor_recommendations']['Insert'];
export type BackendVendorTestimonial = Database['public']['Tables']['vendor_testimonials']['Row']
export type BackendVendorTag = Database['public']['Tables']['tags']['Row'];
export type VendorId = string;

export type VendorTestimonial = Pick<BackendVendorTestimonial, 'id'
  | 'vendor_id'
  | 'review'
  | 'author'
>

export type VendorTag = Pick<BackendVendorTag, 'id'
  | 'display_name'
  | 'is_visible'
  | 'style'
  | 'name'
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
  'specialties': Set<VendorSpecialty>,
  'metro': string | null,
  'metro_region': string | null,
  'state': string | null,
  'instagram': string | null,
  'google_maps_place': string | null,
  'testimonials': VendorTestimonial[],
  'tags': VendorTag[]
};

export enum VendorSpecialty {
  SPECIALTY_HAIR,
  SPECIALTY_MAKEUP
}

function mapTagToSpecialty(tag: VendorTag): VendorSpecialty | null {
  switch (tag.id) {
    case '432fa3e3-9007-4df0-8a5c-dd1d5491194a':
      return VendorSpecialty.SPECIALTY_HAIR;
    case '846350cd-e203-449f-90d0-c112aed74d0b':
      return VendorSpecialty.SPECIALTY_MAKEUP;
    default:
      return null;
  }
};

export function transformBackendVendorToFrontend(vendor: BackendVendor): Vendor {
  const specialties = (vendor.tags ?? []).map(mapTagToSpecialty).filter((specialty) => specialty !== null);
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
    specialties: new Set(specialties),
    metro: vendor.usmetro?.display_name ?? null, // Safely access metro region name
    metro_region: vendor.regions?.name ?? null, // Safely access region name
    state: vendor.usstates?.name ?? null, // Safely access state name
    testimonials: vendor.vendor_testimonials ?? [],
    tags: vendor.tags ?? [],
  };
}

