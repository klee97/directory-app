import type { Database } from "@/types/supabase";


export const IMAGE_PREFIX = 'https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/sign/hmua-cover-photos/';
export type BackendVendor = Database['public']['Tables']['vendors']['Row']
  & {
    usmetro: { name: string } | null // Metro region name (can be null if no metro region found)
    usstates: { name: string } | null      // State name (can be null if no state found)
  };
;

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
> & {
  'bridal_hair_makeup_price': number | null,
  'bridesmaid_hair_makeup_price': number | null,
  'specialties': Set<string>,
  'metroRegion': string | null,
  'state': string | null,
  'instagram': string | null,
}

export function transformBackendVendorToFrontend(vendor: BackendVendor): Vendor {
  return {
    id: vendor.id,
    business_name: vendor.business_name,
    email: vendor.email,
    website: vendor.website,
    instagram: `https://instagram.com/${(vendor.ig_handle ?? '').replace('@', '')}`,
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
    metroRegion: vendor.usmetro?.name ?? null, // Safely access metro region name
    state: vendor.usstates?.name ?? null, // Safely access state name
  };
}