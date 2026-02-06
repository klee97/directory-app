import { Json } from "@/types/supabase";
import { BackendVendorDraft } from "@/types/vendorDraft";
import { VendorFormData } from "@/types/vendorFormData";
import { normalizeUrl } from "./normalizeUrl";
import { normalizeInstagramHandle } from "./normalizeInstagram";

/**
 * Convert VendorFormData (UI) to VendorDraft (DB)
 */
export function formDataToDraft(
  formData: VendorFormData,
  vendorId: string,
  userId: string,
  existingDraftId: string | null
): Omit<BackendVendorDraft, 'images' | 'created_at' | 'updated_at' | 'last_saved_at'> {
  return {
    id: existingDraftId ?? crypto.randomUUID(),
    vendor_id: vendorId,
    user_id: userId,

    // Business
    business_name: formData.business_name || null,
    website: normalizeUrl(formData.website) || null,
    email: null,
    ig_handle: normalizeInstagramHandle(formData.instagram) || null,
    google_maps_place: formData.google_maps_place || null,
    description: formData.description || null,

    // Location - just store the full object
    location_data: formData.locationResult as Json | null,

    travels_world_wide: formData.travels_world_wide,

    // Pricing
    lists_prices: hasAnyPrice(formData),
    bridal_hair_price: formData.bridal_hair_price,
    bridal_makeup_price: formData.bridal_makeup_price,
    "bridal_hair_&_makeup_price": formData["bridal_hair_&_makeup_price"],
    bridesmaid_hair_price: formData.bridesmaid_hair_price,
    bridesmaid_makeup_price: formData.bridesmaid_makeup_price,
    "bridesmaid_hair_&_makeup_price": formData["bridesmaid_hair_&_makeup_price"],

    // Images
    cover_image: formData.cover_image,
    profile_image: null,
    logo: null,

    // Tags
    tags: formData.tags.length > 0 ? formData.tags : null,

    // Metadata
    is_published: false,
  };
}

function hasAnyPrice(formData: VendorFormData): boolean | null {
  return (
    formData.bridal_hair_price !== null ||
    formData.bridal_makeup_price !== null ||
    formData["bridal_hair_&_makeup_price"] !== null ||
    formData.bridesmaid_hair_price !== null ||
    formData.bridesmaid_makeup_price !== null ||
    formData["bridesmaid_hair_&_makeup_price"] !== null
  );
}

