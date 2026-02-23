import { VendorDataInput } from "@/features/profile/admin/util/vendorHelper";
import { LocationResult } from "@/types/location";
import { BackendVendorDraft } from "@/types/vendorDraft";
import { parseVendorMediaArray, parseVendorTags } from "./jsonParser";

/**
 * Convert draft data to VendorDataInput format
 */
export function draftToVendorInput(draft: BackendVendorDraft): VendorDataInput {
  const locationData = draft.location_data as LocationResult | null;
  const latitude = locationData?.lat ?? null;
  const longitude = locationData?.lon ?? null;
  const tags = parseVendorTags(Array.isArray(draft.tags) ? draft.tags : []);
  const media = parseVendorMediaArray(Array.isArray(draft.images) ? draft.images : [])
  const coverImage = media.length > 0 ? media[0] : null;
  return {
    bridal_hair_price: draft.bridal_hair_price ?? null,
    bridal_makeup_price: draft.bridal_makeup_price ?? null,
    "bridal_hair_&_makeup_price": draft["bridal_hair_&_makeup_price"] ?? null,
    bridesmaid_hair_price: draft.bridesmaid_hair_price ?? null,
    bridesmaid_makeup_price: draft.bridesmaid_makeup_price ?? null,
    "bridesmaid_hair_&_makeup_price": draft["bridesmaid_hair_&_makeup_price"] ?? null,
    business_name: draft.business_name ?? null,
    cover_image: coverImage?.media_url ?? null,
    description: draft.description ?? null,
    email: draft.email ?? null,
    google_maps_place: draft.google_maps_place ?? null,
    ig_handle: draft.ig_handle ?? null,
    longitude,
    lists_prices: draft.lists_prices ?? null,
    latitude,
    tags: tags,
    travels_world_wide: draft.travels_world_wide ?? null,
    website: draft.website ?? null,
  } as const;
}
