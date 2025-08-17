import Image, { StaticImageData } from 'next/image';
import { Box } from '@mui/material';
import { IMAGE_PREFIX, R2_IMAGE_PREFIX } from '@/types/vendor';

export default function VendorCardImage({
  vendorImage,
  cardPosition,
  vendorBusinessName,
  placeholderImage,
  variant
}: {
  vendorImage: string | null | undefined;
  cardPosition?: number;
  vendorBusinessName: string | null;
  placeholderImage: StaticImageData;
  variant?: 'default' | 'compact';
}) {
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
        src={vendorImage?.startsWith(IMAGE_PREFIX) || vendorImage?.startsWith(R2_IMAGE_PREFIX)
          ? vendorImage
          : placeholderImage.src}
        alt={`${vendorBusinessName} preview`}
        fill
        sizes="(max-width: 600px) 100vw, 400px"
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        quality={75}
        priority={cardPosition ? cardPosition < 3 : false}
      />
    </Box>
  );
}
