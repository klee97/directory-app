import { Database } from "./supabase";

export type BackendVendorDraft = Database['public']['Tables']['vendor_drafts']['Row'];
export type BackendVendorDraftInsert = Database['public']['Tables']['vendor_drafts']['Insert'];

export type VendorDraft = Pick<BackendVendorDraft, 'id'
  | 'bridal_hair_price'
  | 'bridal_makeup_price'
  | 'bridal_hair_&_makeup_price'
  | 'bridesmaid_hair_price'
  | 'bridesmaid_makeup_price'
  | 'bridesmaid_hair_&_makeup_price'
  | 'business_name'
  | 'cover_image'
  | 'description'
  | 'google_maps_place'
  | 'id'
  | 'ig_handle'
  | 'images'
  | 'is_published'
  | 'lists_prices'
  | 'location_data'
  | 'tags'
  | 'travels_world_wide'
  | 'user_id'
  | 'vendor_id'
  | 'website'
>;