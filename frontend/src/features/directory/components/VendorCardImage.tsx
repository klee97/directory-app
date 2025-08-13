import Image, { StaticImageData } from 'next/image';
import { Box } from '@mui/material';

export default function VendorCardImage({ vendorImage, vendorBusinessName, placeholderImage, variant }: {
  vendorImage: string | null | undefined;
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
        src={vendorImage ?? placeholderImage.src}
        alt={`${vendorBusinessName} preview`}
        fill
        sizes="(max-width: 600px) 100vw, 400px"
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        quality={75}
        priority={false} // can set to true for above-the-fold images
      />
    </Box>
  );
}
