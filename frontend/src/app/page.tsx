import { Directory } from '@/features/directory/components/Directory';
import { fetchAllVendors } from '@/features/directory/api/fetchVendors';
import { unstable_cache } from 'next/cache';
import { Box, Typography } from "@mui/material";

const getCachedVendors = unstable_cache(fetchAllVendors);

export default async function Home() {
  const vendors = await getCachedVendors();

  return (
    <>
      <title>Hair and Makeup Directory for Asian Brides</title>
      <Box display="flex" justifyContent="center" p={4} bgcolor="white">
        <Directory vendors={vendors} />
      </Box>
    </>
  );
}
