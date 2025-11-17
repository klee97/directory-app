import { VendorTag } from "@/types/vendor";

export function parseStringArray(jsonValue: unknown): string[] {
  if (Array.isArray(jsonValue)) {
    return jsonValue.filter((x): x is string => typeof x === "string");
  }
  return [];
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
