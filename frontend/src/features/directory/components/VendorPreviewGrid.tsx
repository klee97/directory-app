'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { VendorCard } from './VendorCard';
import { Vendor } from '@/types/vendor';
import { Carousel } from '@/components/layouts/Carousel';

export function VendorPreviewGrid({ vendors }: { vendors: Vendor[] }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (isSmallScreen) {
    return (
      <Carousel>
        {vendors.map((vendor, index) => (
          <Box
            key={vendor.id}
            sx={{
              flex: '0 0 auto',
              width: { xs: 260, sm: 280 },
              scrollSnapAlign: 'start',
            }}
          >
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
              variant="compact"
            />
          </Box>
        ))}
      </Carousel>
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
