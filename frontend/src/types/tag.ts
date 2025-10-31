import { Database } from "./supabase";

export type BackendVendorTag = Database["public"]["Tables"]["tags"]["Row"];

export enum VendorSpecialty {
  SPECIALTY_HAIR = "SPECIALTY_HAIR",
  SPECIALTY_MAKEUP = "SPECIALTY_MAKEUP",
  SKILL_SOUTH_ASIAN_MAKEUP = "SKILL_SOUTH_ASIAN",
  SKILL_THAI_MAKEUP = "SKILL_THAI"
}

export function hasTag(tags: { id: string }[], id: string): boolean {
  return tags.some(tag => tag.id === id);
}

// For type or name checks:
export function hasTagByType(tags: { type?: string }[], type: string): boolean {
  return tags.some(tag => tag.type === type);
}

export function hasTagByName(tags: { name: string }[], name: string): boolean {
  return tags.some(tag => tag.name === name);
}