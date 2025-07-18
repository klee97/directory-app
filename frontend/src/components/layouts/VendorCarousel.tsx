'use client';

import { VendorByDistance } from '@/types/vendor';
import { VendorCard } from '@/features/directory/components/VendorCard';
import Box from '@mui/material/Box';
import { Carousel } from './Carousel';

export const VendorCarousel = ({
  vendors,
  title,
}: {
  vendors: VendorByDistance[];
  title?: string;
}) => {
  return (
    <Carousel title={title}>
      {vendors.map((vendor, index) => (
        <Box
          key={vendor.id}
          sx={{
            flex: '0 0 auto',
            width: { xs: 220, sm: 240 },
            scrollSnapAlign: 'start',
          }}
        >
          <VendorCard
            vendor={vendor}
            searchParams=""
            onFocus={() => { }}
            onBlur={() => { }}
            positionIndex={index}
            tabIndex={0}
            className=""
            showFavoriteButton={false}
            isFavorite={false}
            variant="compact"
          />
        </Box>
      ))}
    </Carousel>
  );
};
