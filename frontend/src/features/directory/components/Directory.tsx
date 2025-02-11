"use client"
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import { Vendor } from '@/types/vendor';
import FilterableVendorTable from './FilterableVendorTable';
import { Suspense } from 'react';


export function Directory({ vendors }: {
  vendors: Vendor[]
}) {
  // Get unique regions from the vendor data
  const uniqueRegions = Array.from(
    new Set(
      vendors
        .map((vendor) => vendor.region)
        .filter((region): region is string => region !== null && region !== undefined)
    )
  );
  return (
    <Container
      maxWidth="lg"
      component="main"
      sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
    >
      <div>
        <Typography variant="h1" gutterBottom>
          Hair and Makeup Artists for Asian Brides
        </Typography>
        <Typography>Welcome to the Hair and Makeup Artist (HMUA) Directory for Asian Brides! Our online directory features talented artists who have experience with Asian features.

Search by location, see who travels, and find the perfect artist in your price range.</Typography>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <FilterableVendorTable
          uniqueRegions={uniqueRegions}
          vendors={vendors}
        />
      </Suspense>
    </Container>
  );
}