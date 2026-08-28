'use client';

import { useSearchParams } from 'next/navigation';
import { Vendor } from '@/types/vendor';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { VendorCarousel } from '@/components/layouts/VendorCarousel';
import { LATITUDE_PARAM, LONGITUDE_PARAM, SEARCH_PARAM, SERVICE_PARAM, SKILL_PARAM, TRAVEL_PARAM } from '@/lib/constants';
import { sanitizeFilterBoolean, sanitizeFilterValues } from '@/lib/directory/sanitizeFilterParams';

interface NearbyVendorsClientProps {
  vendors: Vendor[];
  resolvedLocation?: string;
  serviceTags: string[];
  skillTags: string[];
}

export default function NearbyVendorsClient({ vendors, resolvedLocation, serviceTags, skillTags }: NearbyVendorsClientProps) {
  const searchParams = useSearchParams();

  const filterContext = {
    lat: searchParams.get(LATITUDE_PARAM) ? parseFloat(searchParams.get(LATITUDE_PARAM)!) : null,
    lon: searchParams.get(LONGITUDE_PARAM) ? parseFloat(searchParams.get(LONGITUDE_PARAM)!) : null,
    selectedSkills: sanitizeFilterValues(searchParams.getAll(SKILL_PARAM), skillTags),
    selectedServices: sanitizeFilterValues(searchParams.getAll(SERVICE_PARAM), serviceTags),
    travelsWorldwide: sanitizeFilterBoolean(searchParams.get(TRAVEL_PARAM)),
    searchQuery: searchParams.get(SEARCH_PARAM) || null,
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