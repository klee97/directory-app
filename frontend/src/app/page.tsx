import { Directory } from '@/features/directory/components/Directory';
import { fetchAllVendors } from '@/features/directory/api/fetchVendors';
import { unstable_cache } from 'next/cache';
import { Box } from "@mui/material";

const getCachedVendors = unstable_cache(fetchAllVendors);

export default async function Home() {
  const vendors = await getCachedVendors();
  // Get unique regions from the vendor data
  const uniqueMetroRegions = Array.from(
    new Set(
      vendors
        .map((vendor) => vendor.metro_region)
        .filter((region): region is string => region !== null && region !== undefined)
    )
  );
  return (
    <>
      <title>Hair and Makeup Directory for Asian Brides</title>
      <Box display="flex" justifyContent="center" p={4}>
        <Directory vendors={vendors} uniqueMetroRegions={uniqueMetroRegions} />
      </Box>
    </>
  );
}
