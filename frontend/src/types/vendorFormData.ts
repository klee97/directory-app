import { LocationResult } from "./location";
import { VendorTag } from "./vendor";
import { VendorMediaForm } from "./vendorMedia";

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
  cover_image: VendorMediaForm | null;
  tags: VendorTag[];
}

export interface VendorFormDataAdmin {
  "bridal_hair_&_makeup_price": number | null;
  bridal_hair_price: number | null;
  bridal_makeup_price: number | null;
  "bridesmaid_hair_&_makeup_price": number | null;
  bridesmaid_hair_price: number | null;
  bridesmaid_makeup_price: number | null;
  business_name: string | null;
  cover_image: VendorMediaForm | null;
  description: string | null;
  email: string | null;
  google_maps_place: string | null;
  instagram: string | null;
  latitude: number | null;
  lists_prices: boolean | null;
  longitude: number | null;
  region: string | null;
  tags: VendorTag[] | null;
  travels_world_wide: boolean | null;
  website: string | null;
}

export type VendorFormField =
  | keyof VendorFormData
  | 'services'
  | 'location';

export const HAIR_PRICE_FIELDS = [
  'bridal_hair_price',
  'bridesmaid_hair_price',
] as const;

export const MAKEUP_PRICE_FIELDS = [
  'bridal_makeup_price',
  'bridesmaid_makeup_price',
] as const;

export const COMBO_PRICE_FIELDS = [
  'bridal_hair_&_makeup_price',
  'bridesmaid_hair_&_makeup_price',
] as const;