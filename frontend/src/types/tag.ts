import { TagOption } from "@/features/business/common/components/TagSelector";
import { Database } from "./supabase";
import { VendorTag } from "./vendor";

export type BackendVendorTag = Database["public"]["Tables"]["tags"]["Row"];

const SPECIALTY_HAIR_TAG_ID = "432fa3e3-9007-4df0-8a5c-dd1d5491194a";
const SPECIALTY_MAKEUP_TAG_ID = "846350cd-e203-449f-90d0-c112aed74d0b";
const SKILL_SOUTH_ASIAN_TAG_ID = "90944527-f735-461c-92cf-79395c93c371";
const SKILL_THAI_TAG_ID = "a20f1a71-6460-4af2-a295-cef39ad71ed8";

export enum VendorSpecialty {
  SPECIALTY_HAIR = "SPECIALTY_HAIR",
  SPECIALTY_MAKEUP = "SPECIALTY_MAKEUP",
  SKILL_SOUTH_ASIAN_MAKEUP = "SKILL_SOUTH_ASIAN",
  SKILL_THAI_MAKEUP = "SKILL_THAI"
}

export const VendorSpecialtyDisplayNames: Record<VendorSpecialty, string> = {
  [VendorSpecialty.SPECIALTY_HAIR]: "Hair",
  [VendorSpecialty.SPECIALTY_MAKEUP]: "Makeup",
  [VendorSpecialty.SKILL_SOUTH_ASIAN_MAKEUP]: "South Asian Makeup",
  [VendorSpecialty.SKILL_THAI_MAKEUP]: "Thai Makeup"
};

// List of predefined tags
export const tagsOptionsMap: Map<string, TagOption> = new Map<string, TagOption>([
  [VendorSpecialty.SPECIALTY_HAIR.toString(), { unique_tag: VendorSpecialty.SPECIALTY_HAIR, id: SPECIALTY_HAIR_TAG_ID }],
  [VendorSpecialty.SPECIALTY_MAKEUP.toString(), { unique_tag: VendorSpecialty.SPECIALTY_MAKEUP, id: SPECIALTY_MAKEUP_TAG_ID }],
  [VendorSpecialty.SKILL_SOUTH_ASIAN_MAKEUP.toString(), { unique_tag: VendorSpecialty.SKILL_SOUTH_ASIAN_MAKEUP, id: SKILL_SOUTH_ASIAN_TAG_ID }],
  [VendorSpecialty.SKILL_THAI_MAKEUP.toString(), { unique_tag: VendorSpecialty.SKILL_THAI_MAKEUP, id: SKILL_THAI_TAG_ID }]
]);

export function mapTagToSpecialty(tag: VendorTag): VendorSpecialty | null {
  switch (tag.id) {
    case SPECIALTY_HAIR_TAG_ID:
      return VendorSpecialty.SPECIALTY_HAIR;
    case SPECIALTY_MAKEUP_TAG_ID:
      return VendorSpecialty.SPECIALTY_MAKEUP;
    case SKILL_SOUTH_ASIAN_TAG_ID:
      return VendorSpecialty.SKILL_SOUTH_ASIAN_MAKEUP;
    case SKILL_THAI_TAG_ID:
      return VendorSpecialty.SKILL_THAI_MAKEUP;
    default:
      return null;
  }
};