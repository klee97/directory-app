'use client';

import { useSearchParams } from 'next/navigation';
import { Vendor } from '@/types/vendor';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { VendorCarousel } from '@/components/layouts/VendorCarousel';

interface NearbyVendorsClientProps {
  vendors: Vendor[];
  resolvedLocation?: string;
}

export default function NearbyVendorsClient({ vendors, resolvedLocation }: NearbyVendorsClientProps) {
  const searchParams = useSearchParams();

  const filterContext = {
    lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null,
    lon: searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : null,
    selectedSkills: searchParams.get('skills')?.split(',') ?? [],
    selectedServices: searchParams.get('services')?.split(',') ?? [],
    travelsWorldwide: searchParams.get('travelsWorldwide') === 'true',
    searchQuery: searchParams.get('q') || null,
  };

  return (
    <Box>
      <Divider sx={{ mt: 20, mb: 4 }} />
      <VendorCarousel
        vendors={vendors}
        title={`More wedding makeup artists for Asian features near ${resolvedLocation}`}
        filterContext={filterContext}
      />
    </Box>
  );
}