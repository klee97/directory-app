import Image, { StaticImageData } from 'next/image';
import { Box } from '@mui/material';
import { VendorMedia } from '@/types/vendorMedia';

export default function VendorCardImage({
  vendorImage,
  cardPosition,
  imageIndex = 0, // defaults to 0 for non-carousel single-image usage
  vendorBusinessName,
  placeholderImage,
  variant
}: {
  vendorImage: Partial<VendorMedia> | null | undefined;
  cardPosition?: number;
  imageIndex?: number;
  vendorBusinessName: string | null;
  placeholderImage: StaticImageData;
  variant?: 'default' | 'compact';
}) {

  const eagerThreshold = variant === 'compact' ? 1 : 3;
  // Only the first slide of an above-the-fold card should skip lazy-loading.
  // Later slides in the same card's swiper are only seen after a swipe
  const isAboveTheFold =
    imageIndex === 0 && cardPosition !== undefined && cardPosition < eagerThreshold;
  const isLikelyLCP = imageIndex === 0 && cardPosition === 0;

  return (
    <Box
      sx={{
        position: 'relative',
        height: variant === 'compact' ? 180 : 300,
        width: '100%',
        zIndex: 1,
        overflow: 'hidden'
      }}
    >
      <Image
        src={vendorImage?.media_url ?? placeholderImage}
        alt={`${vendorBusinessName ?? ''} preview`}
        fill
        sizes={variant === 'compact' ? '240px' : '(max-width: 600px) 100vw, 400px'}
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        quality={75}
        loading={isAboveTheFold ? 'eager' : 'lazy'}
        fetchPriority={isLikelyLCP ? 'high' : 'auto'}
      />
    </Box>
  );
}