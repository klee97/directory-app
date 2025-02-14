"use client"
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import { Vendor } from '@/types/vendor';
import FilterableVendorTable from './FilterableVendorTable';
import { Suspense } from 'react';


export function Directory({ vendors, uniqueMetroRegions }: {
  vendors: Vendor[],
  uniqueMetroRegions: string[]
}) {


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
        <Typography>Welcome to the Hair and Makeup Artist Directory for Asian Brides! Our online directory features talented artists who have experience with Asian features.

Search by location, see who travels, and find the perfect artist in your price range.</Typography>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <FilterableVendorTable
          uniqueRegions={uniqueMetroRegions}
          vendors={vendors}
        />
      </Suspense>
    </Container>
  );
}