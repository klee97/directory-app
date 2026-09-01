import { describe, it, expect } from 'vitest';
import { computeLocationStats } from './computeLocationStats';
import { VendorByDistance, VendorTag } from '@/types/vendor';

function makeTag(overrides: Partial<VendorTag> = {}): VendorTag {
  return {
    id: 'tag-1',
    display_name: 'Hair',
    type: 'SERVICE',
    is_visible: true,
    style: 'primary',
    name: 'SPECIALTY_HAIR',
    ...overrides,
  };
}

const HAIR_TAG = makeTag({ id: 'hair', display_name: 'Hair', name: 'SPECIALTY_HAIR' });
const MAKEUP_TAG = makeTag({ id: 'makeup', display_name: 'Makeup', name: 'SPECIALTY_MAKEUP' });
const THAI_TAG = makeTag({ id: 'thai', display_name: 'Thai Makeup', type: 'SKILL', style: 'default', name: 'SKILL_THAI' });
const SOUTH_ASIAN_TAG = makeTag({ id: 'sa', display_name: 'South Asian Makeup', type: 'SKILL', style: 'default', name: 'SKILL_SOUTH_ASIAN' });

function makeVendor(overrides: Partial<VendorByDistance> = {}): VendorByDistance {
  return {
    id: 'v1',
    business_name: 'Test Vendor',
    email: null,
    website: null,
    region: null,
    city: 'New York',
    state: 'New York',
    country: 'United States',
    travels_world_wide: false,
    slug: 'test-vendor',
    bridal_hair_price: null,
    bridal_makeup_price: null,
    bridesmaid_hair_price: null,
    bridesmaid_makeup_price: null,
    bridal_hair_makeup_price: null,
    bridesmaid_hair_makeup_price: null,
    gis: null,
    google_maps_place: null,
    profile_image: null,
    description: null,
    latitude: 40.7128,
    longitude: -74.0060,
    inquiries_opted_out_at: null,
    verified_at: null,
    metro: null,
    metro_region: null,
    instagram: null,
    testimonials: [],
    tags: [],
    images: [],
    cover_image: null,
    is_premium: false,
    distance_miles: null,
    ...overrides,
  };
}

describe('computeLocationStats', () => {
  it('returns all zeros / nulls for an empty vendor list', () => {
    const stats = computeLocationStats([]);
    expect(stats).toEqual({
      vendorCount: 0,
      verifiedCount: 0,
      offersHairCount: 0,
      offersMakeupCount: 0,
      thaiMakeupCount: 0,
      southAsianMakeupCount: 0,
      priceRange: null,
    });
  });

  it('counts vendors and verification status correctly', () => {
    // Mirrors seed data: TEST-E2E-001 verified, TEST-E2E-002/003/004 unverified
    const vendors = [
      makeVendor({ id: 'TEST-E2E-001', verified_at: '2024-01-01T00:00:00Z', tags: [HAIR_TAG, THAI_TAG] }),
      makeVendor({ id: 'TEST-E2E-002', verified_at: null, tags: [HAIR_TAG] }),
      makeVendor({ id: 'TEST-E2E-003', verified_at: null, tags: [MAKEUP_TAG] }),
    ];
    const stats = computeLocationStats(vendors);
    expect(stats.vendorCount).toBe(3);
    expect(stats.verifiedCount).toBe(1);
  });

  it('counts service tags independently — a vendor can count toward both hair and makeup', () => {
    const vendors = [
      makeVendor({ tags: [HAIR_TAG, MAKEUP_TAG] }), // offers both
      makeVendor({ tags: [HAIR_TAG] }),
      makeVendor({ tags: [MAKEUP_TAG] }),
    ];
    const stats = computeLocationStats(vendors);
    expect(stats.offersHairCount).toBe(2);
    expect(stats.offersMakeupCount).toBe(2);
  });

  it('counts skill tags (Thai / South Asian makeup) separately from service tags', () => {
    const vendors = [
      makeVendor({ tags: [HAIR_TAG, THAI_TAG] }),
      makeVendor({ tags: [MAKEUP_TAG, SOUTH_ASIAN_TAG] }),
      makeVendor({ tags: [HAIR_TAG] }), // neither skill
    ];
    const stats = computeLocationStats(vendors);
    expect(stats.thaiMakeupCount).toBe(1);
    expect(stats.southAsianMakeupCount).toBe(1);
  });

  it('returns null priceRange when no vendor has any price set (matches current seed data)', () => {
    const vendors = [makeVendor({ bridal_hair_price: null, bridal_makeup_price: null, bridal_hair_makeup_price: null })];
    const stats = computeLocationStats(vendors);
    expect(stats.priceRange).toBeNull();
  });

  it('computes min/max price across all three price fields, ignoring nulls and zeros', () => {
    const vendors = [
      makeVendor({ bridal_makeup_price: 500, bridal_hair_price: null, bridal_hair_makeup_price: null }),
      makeVendor({ bridal_makeup_price: null, bridal_hair_price: 0, bridal_hair_makeup_price: 900 }), // 0 excluded
    ];
    const stats = computeLocationStats(vendors);
    expect(stats.priceRange).toEqual({ min: 500, max: 900 });
  });

  it('handles a single vendor (grammar-relevant edge case for LocationIntro/FAQ)', () => {
    const stats = computeLocationStats([makeVendor({ verified_at: '2024-01-01T00:00:00Z' })]);
    expect(stats.vendorCount).toBe(1);
    expect(stats.verifiedCount).toBe(1);
  });
});