import { Vendor } from "@/types/vendor";

export function getUniqueVisibleTagNames(vendors: Vendor[]): string[] {
  return Array.from(
    new Set(
      vendors
        .flatMap(vendor => vendor.tags ?? [])
        .filter(tag => tag && tag.is_visible)
        .map(tag => tag.display_name)
        .filter((name): name is string => name !== null) // type guard
        .sort()
    )
  );
}