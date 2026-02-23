import { VendorFormDataAdmin } from "@/types/vendorFormData";
import { normalizeUrl } from "./normalizeUrl";
import { normalizeInstagramHandle } from "./normalizeInstagram";
import { VendorDataInput } from "@/features/profile/admin/util/vendorHelper";

/**
 * Convert VendorFormData (UI) to VendorDraft (DB)
 */
export function formDataToVendor(
  formData: VendorFormDataAdmin,
  coverImageUrl: string | null
): VendorDataInput {
  return {
    ...formData,
    cover_image: coverImageUrl,
    website: formData.website ? normalizeUrl(formData.website) : null,
    ig_handle: formData.instagram ? normalizeInstagramHandle(formData.instagram) : null,
    google_maps_place: formData.google_maps_place || null,
  };
}
