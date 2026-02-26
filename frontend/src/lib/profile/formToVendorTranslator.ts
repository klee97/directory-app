import { VendorFormDataAdmin } from "@/types/vendorFormData";
import { normalizeUrl } from "./normalizeUrl";
import { normalizeInstagramHandle } from "./normalizeInstagram";
import { VendorDataInput } from "@/features/profile/admin/util/vendorHelper";
import { hasAnyPrice } from "./priceHelper";

/**
 * Convert VendorFormData (UI) to VendorDraft (DB)
 */
export function formDataToVendor(
  formData: VendorFormDataAdmin,
  coverImageUrl: string | null
): VendorDataInput {

  return {
    bridal_hair_price: formData.bridal_hair_price,
    bridal_makeup_price: formData.bridal_makeup_price,
    "bridal_hair_&_makeup_price": formData["bridal_hair_&_makeup_price"],
    bridesmaid_hair_price: formData.bridesmaid_hair_price,
    bridesmaid_makeup_price: formData.bridesmaid_makeup_price,
    "bridesmaid_hair_&_makeup_price": formData["bridesmaid_hair_&_makeup_price"],
    business_name: formData.business_name || null,
    cover_image: coverImageUrl,
    description: formData.description || null,
    google_maps_place: normalizeUrl(formData.google_maps_place) || null,
    ig_handle: formData.instagram ? normalizeInstagramHandle(formData.instagram) : null,
    latitude: formData.locationResult?.lat || null,
    lists_prices: hasAnyPrice(formData),
    longitude: formData.locationResult?.lon || null,
    tags: formData.tags || null,
    travels_world_wide: formData.travels_world_wide,
    website: normalizeUrl(formData.website) || null,
  };
}

