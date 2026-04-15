import { BackendVendor } from "@/types/vendor";
import { VendorMedia } from "@/types/vendorMedia";
import { isAllowedPrefix } from "@/lib/images/prefixes";

export function processVendorImages(
  vendor: BackendVendor,
): VendorMedia[] {

  if (!vendor.vendor_media || vendor.vendor_media.length === 0) {
    if (vendor.cover_image) {
      console.warn("Vendor %s has no vendor_media but has cover_image. Consider migrating cover_image to vendor_media for image handling.", vendor.business_name);
    }
    return [];
  }

  const images: VendorMedia[] = vendor.vendor_media
    .map((image) =>
      createVendorMedia(image.media_url, vendor.id, {
        id: image.id,
        is_featured: image.is_featured,
        consent_given: image.consent_given,
        credits: image.credits,
      })
    )
    .filter(image => image !== null);
  return images;
}

/**
 * Creates a VendorMedia object from a URL with migration support
 * Returns null if URL has unsupported prefix
 */
function createVendorMedia(
  url: string,
  vendorId: string,
  overrides: {
    id: string;
    is_featured?: boolean | null;
    consent_given?: boolean | null;
    credits?: string | null;
  }
): VendorMedia | null {
  if (!isAllowedPrefix(url)) {
    return null;
  }

  console.debug(`overrides:`, overrides);
  return {
    id: overrides.id,
    vendor_id: vendorId,
    is_featured: overrides.is_featured ?? false,
    consent_given: overrides.consent_given ?? false,
    credits: overrides.credits ?? null,
    media_url: url
  };
}