import { Directory } from '@/features/directory/components/Directory';
import { fetchAllVendors } from '@/features/directory/api/fetchVendors';
import { unstable_cache } from 'next/cache';

const getCachedVendors = unstable_cache(fetchAllVendors);

export default async function Home() {
  const vendors = await getCachedVendors();
  // Get unique regions from the vendor data
  const uniqueMetroRegions = Array.from(
    new Set(
      vendors
        .map((vendor) => vendor.metro_region)
        .filter((region): region is string => region !== null && region !== undefined)
        .sort()
    )
  );
  return (
    <>
      <title>Hair and Makeup Directory for Asian Beauty</title>
      <Directory vendors={vendors} uniqueMetroRegions={uniqueMetroRegions} />
    </>
  );
}
