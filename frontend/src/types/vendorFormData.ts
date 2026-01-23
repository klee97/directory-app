import { LocationResult } from "./location";
import { VendorTag } from "./vendor";

export interface VendorFormData {
  business_name: string;
  locationResult: LocationResult | null;
  travels_world_wide: boolean;
  website: string;
  instagram: string;
  google_maps_place: string;
  description: string;
  bridal_hair_price: number | null;
  bridal_makeup_price: number | null;
  "bridal_hair_&_makeup_price": number | null;
  bridesmaid_hair_price: number | null;
  bridesmaid_makeup_price: number | null;
  "bridesmaid_hair_&_makeup_price": number | null;
  cover_image: string | null;
  tags: VendorTag[];
  images: string[] | null;
}

export type VendorFormField =
  | keyof VendorFormData
  | 'services'
  | 'location';