import { Vendor } from "@/types/vendor";

export interface FilterTags {
  skills: string[];
  services: string[];
}

export function getUniqueVisibleTagNames(vendors: Vendor[]): FilterTags {
  const allTags = vendors
    .flatMap(vendor => vendor.tags ?? [])
    .filter(tag => tag && tag.is_visible);

  const serviceTags = Array.from(
    new Set(
      allTags
        .filter(tag => tag.style === 'primary')
        .map(tag => tag.display_name)
        .filter((name): name is string => name !== null) // type guard
        .sort()
    )
  );

  const skillTags = Array.from(
    new Set(
      allTags
        .filter(tag => tag.style !== 'primary')
        .map(tag => tag.display_name)
        .filter((name): name is string => name !== null) // type guard
        .sort()
    )
  );

  return {
    skills: skillTags,
    services: serviceTags
  };
}