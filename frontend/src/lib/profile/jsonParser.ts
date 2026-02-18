import { VendorTag } from "@/types/vendor";
import { VendorMedia } from "@/types/vendorMedia";

export function parseStringArray(jsonValue: unknown): string[] {
  if (Array.isArray(jsonValue)) {
    return jsonValue.filter((x): x is string => typeof x === "string");
  }
  return [];
}

export function parseVendorMediaArray(jsonValue: unknown): VendorMedia[] {
  if (!Array.isArray(jsonValue)) return [];

  return jsonValue.filter((m): m is VendorMedia => {
    if (!m || typeof m !== "object") return false;
    const media = m as Record<string, unknown>;
    return (
      // Require id and media_url to be strings (not optional)
      typeof media.id === "string" &&
      typeof media.media_url === "string" &&
      // Other fields are truly optional
      ("approved_at" in media ? typeof media.approved_at === "string" || media.approved_at === null : true) &&
      ("consent_given" in media ? typeof media.consent_given === "boolean" : true) &&
      ("created_at" in media ? typeof media.created_at === "string" : true) &&
      ("credits" in media ? typeof media.credits === "string" || media.credits === null : true) &&
      ("is_featured" in media ? typeof media.is_featured === "boolean" || media.is_featured === null : true) &&
      ("vendor_id" in media ? typeof media.vendor_id === "string" : true)
    );
  });
}

export function parseVendorTags(jsonValue: unknown): VendorTag[] {
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
