'use client';

import Grid from '@mui/material/Grid2';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { VendorCard } from './VendorCard';
import { Vendor } from '@/types/vendor';
import { VendorCarousel } from "@/components/layouts/VendorCarousel";

export function VendorPreviewGrid({ vendors }: { vendors: Vendor[] }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (isSmallScreen) {
    return (
        <VendorCarousel vendors={vendors}/>
    );
  }

  return (
    <Grid container spacing={2}>
      {vendors.map((vendor, index) => (
        <Grid key={vendor.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <VendorCard
            vendor={vendor}
            searchParams=""
            onFocus={() => {}}
            onBlur={() => {}}
            positionIndex={index}
            tabIndex={0}
            className=""
            isFavorite={false}
            showFavoriteButton={false}
          />
        </Grid>
      ))}
    </Grid>
  );
}
