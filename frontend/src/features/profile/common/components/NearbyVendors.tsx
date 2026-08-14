import { Vendor } from '@/types/vendor';
import { getVendorsByDistanceWithFallback } from '@/features/directory/api/fetchVendorsByLocation';
import { SEARCH_RADIUS_MILES_DEFAULT } from '@/types/location';
import NearbyVendorsClient from './NearbyVendorsClient';


export default async function NearbyVendors({ vendor, resolvedLocation }: { vendor: Vendor, resolvedLocation: string }) {
  let nearbyVendors: Vendor[] = [];

  if (vendor.latitude && vendor.longitude) {
    const allNearbyVendors = await getVendorsByDistanceWithFallback(
      vendor.latitude,
      vendor.longitude,
      vendor.country,
      SEARCH_RADIUS_MILES_DEFAULT,
      10
    );

    nearbyVendors = allNearbyVendors
      .filter((v) => v.id !== vendor.id)
      .sort((a, b) => Number(b.is_premium || b.verified_at) - Number(a.is_premium || a.verified_at));
  }

  console.log(`Found ${nearbyVendors.length} nearby vendors for ${vendor.business_name} (${vendor.slug})`);

  if (nearbyVendors.length === 0) return null;

  return <NearbyVendorsClient vendors={nearbyVendors} resolvedLocation={resolvedLocation} />;
}