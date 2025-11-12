import { VendorTag } from "@/types/vendor";
import { BackendVendorDraft } from "@/types/vendorDraft";
import { VendorFormData } from "@/types/vendorFormData";

/**
 * Convert DB draft to UI form state
 */
export function draftToFormData(draft: BackendVendorDraft): VendorFormData {
  const tags = parseVendorTags(Array.isArray(draft.tags) ? draft.tags : []);
  const images = parseStringArray(Array.isArray(draft.images) ? draft.images : []);
  const locationResult = draft.location_data
    ? JSON.parse(JSON.stringify(draft.location_data))
    : null;
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
    cover_image: draft.cover_image,
    images,
    tags
  };
}

function parseStringArray(jsonValue: unknown): string[] {
  if (Array.isArray(jsonValue)) {
    return jsonValue.filter((x): x is string => typeof x === "string");
  }
  return [];
}

function parseVendorTags(jsonValue: unknown): VendorTag[] {
  if (!Array.isArray(jsonValue)) return [];

  return jsonValue.filter((t): t is VendorTag => {
    if (!t || typeof t !== "object") return false;
    const tag = t as Record<string, unknown>;
    return (
      typeof tag.id === "string" &&
      typeof tag.name === "string" &&
      // optional fields can be string | null | boolean | undefined
      ("display_name" in tag ? typeof tag.display_name === "string" || tag.display_name === null : true) &&
      ("type" in tag ? typeof tag.type === "string" || tag.type === null : true) &&
      ("is_visible" in tag ? typeof tag.is_visible === "boolean" || tag.is_visible === null : true) &&
      ("style" in tag ? typeof tag.style === "string" || tag.style === null : true)
    );
  });
}
