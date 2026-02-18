import Image, { StaticImageData } from 'next/image';
import Box from '@mui/material/Box';
import { SwiperCarousel } from './SwiperCarousel';
import { useState } from 'react';
import { VendorMedia } from '@/types/vendorMedia';

export const PhotoCarousel = ({ photos, vendorSlug, placeholderImage }: {
  photos: Partial<VendorMedia>[],
  vendorSlug: string | null,
  placeholderImage: StaticImageData,
}) => {
  const [swiperIndex, setSwiperIndex] = useState(0);

  return (
    <SwiperCarousel vendorSlug={vendorSlug} swiperIndex={swiperIndex} setSwiperIndex={setSwiperIndex}>
      {photos.map((photo, index) => (
        <Box
          key={index}
          sx={{
            flex: '0 0 auto',
            scrollSnapAlign: 'start',
            height: { xs: 300, sm: 400 },
            aspectRatio: '3/4',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              borderRadius: 2,
              maxWidth: { xs: '45vw', sm: 400 },
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              marginX: 'auto',
            }}
          >
            <Image
              src={photo.media_url ?? placeholderImage}
              alt={`${vendorSlug} photo ${index + 1}`}
              fill
              sizes="(max-width: 600px) 45vw, 400px"
              style={{
                objectFit: 'cover',
              }}
              quality={85}
              priority={index < 3}
            />
          </Box>
        </Box>
      ))}
    </SwiperCarousel>
  );
};
