import type { Database } from "@/types/supabase";

export const IMAGE_PREFIX = 'https://format.creatorcdn.com';
export type BackendVendor = Database['public']['Tables']['vendors']['Row'];

export type Vendor = Pick<BackendVendor, 'id'
  | 'business_name'
  | 'email'
  | 'website'
  | 'instagram'
  | 'region'
  | 'travels_world_wide'
  | 'slug'
  | 'cover_image'
> & {
  'bridal_hair_makeup_price': number | null;
  'bridesmaid_hair_makeup_price': number | null;
  'specialties': string[];
}

export function transformBackendVendorToFrontend(vendor: BackendVendor): Vendor {
  return {
    id: vendor.id,
    business_name: vendor.business_name,
    email: vendor.email,
    website: vendor.website,
    instagram: `https://instagram.com/${(vendor.instagram ?? '').replace('@', '')}`,
    region: vendor.region,
    travels_world_wide: vendor.travels_world_wide,
    slug: vendor.slug,
    cover_image: vendor.cover_image && vendor.cover_image.startsWith(IMAGE_PREFIX) ? vendor.cover_image : null,
    specialties: (vendor.specialization ?? '').split(','),
    bridal_hair_makeup_price: vendor['bridal_hair_&_makeup_price'] !== null
      ? Number.parseInt(vendor['bridal_hair_&_makeup_price'])
      : null
    ,
    bridesmaid_hair_makeup_price: vendor['bridesmaid_hair_&_makeup_price'] !== null
      ? Number.parseInt(vendor['bridesmaid_hair_&_makeup_price'])
      : null
  };
}