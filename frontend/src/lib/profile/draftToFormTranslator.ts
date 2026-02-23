import { BackendVendorDraft } from "@/types/vendorDraft";
import { VendorFormData } from "@/types/vendorFormData";
import { parseVendorTags } from "./jsonParser";

/**
 * Convert DB draft to UI form state
 */
export function draftToFormData(draft: BackendVendorDraft): VendorFormData {
  const tags = parseVendorTags(Array.isArray(draft.tags) ? draft.tags : []);
  const locationResult = draft.location_data
    ? JSON.parse(JSON.stringify(draft.location_data))
    : null;
  const images = draft.images ? JSON.parse(JSON.stringify(draft.images)) : [];
  return {
    // Convert null to empty string for UI
    business_name: draft.business_name ?? '',
    website: draft.website ?? '',
    instagram: draft.ig_handle ?? '',
    google_maps_place: draft.google_maps_place ?? '',
    description: draft.description ?? '',

    // Location
    locationResult,
    travels_world_wide: draft.travels_world_wide ?? false,

    // Pricing
    bridal_hair_price: draft.bridal_hair_price,
    bridal_makeup_price: draft.bridal_makeup_price,
    "bridal_hair_&_makeup_price": draft["bridal_hair_&_makeup_price"],
    bridesmaid_hair_price: draft.bridesmaid_hair_price,
    bridesmaid_makeup_price: draft.bridesmaid_makeup_price,
    "bridesmaid_hair_&_makeup_price": draft["bridesmaid_hair_&_makeup_price"],

    // Images
    cover_image: images.length > 0 ? images[0] : null,
    tags
  };
}

