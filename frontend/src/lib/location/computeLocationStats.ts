import { hasTagByName, VendorSpecialty } from '@/types/tag';
import { VendorByDistance } from '@/types/vendor';

export interface LocationStats {
  vendorCount: number;
  verifiedCount: number;
  offersHairCount: number;
  offersMakeupCount: number;
  thaiMakeupCount: number;
  southAsianMakeupCount: number;
  priceRange: { min: number; max: number } | null;
}

export function computeLocationStats(vendors: VendorByDistance[]): LocationStats {
  const prices = vendors
    .flatMap(v => [
      v.bridal_makeup_price,
      v.bridal_hair_price,
      v.bridal_hair_makeup_price,
    ])
    .filter((p): p is number => typeof p === 'number' && p > 0);

  return {
    vendorCount: vendors.length,
    verifiedCount: vendors.filter(v => v.verified_at).length,
    offersHairCount: vendors.filter(v => hasTagByName(v.tags, VendorSpecialty.SPECIALTY_HAIR)).length,
    offersMakeupCount: vendors.filter(v => hasTagByName(v.tags, VendorSpecialty.SPECIALTY_MAKEUP)).length,
    thaiMakeupCount: vendors.filter(v => hasTagByName(v.tags, VendorSpecialty.SKILL_THAI_MAKEUP)).length,
    southAsianMakeupCount: vendors.filter(v => hasTagByName(v.tags, VendorSpecialty.SKILL_SOUTH_ASIAN_MAKEUP)).length,
    priceRange: prices.length
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : null,
  };
}