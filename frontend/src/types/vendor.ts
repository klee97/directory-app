import type { Database } from "@/types/supabase";

export type Vendor = Database['public']['Tables']['vendors']['Row'];

export type VendorProfile = Pick<Vendor, 'id'
  | 'business_name'
  | 'email'
  | 'website'
  | 'instagram'
  | 'region'
  | 'travels_world_wide'
  | 'slug'
>;