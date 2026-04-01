'use client';

import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Image from 'next/image';
import { VendorMedia } from '@/types/vendorMedia';
import { StaticImageData } from 'next/image';

export function VendorCoverImage({
  coverImage,
  businessName,
  placeholderImage,
}: {
  coverImage: Partial<VendorMedia>;
  businessName: string | null;
  placeholderImage: StaticImageData;
}) {
  return (
    <Card elevation={0} sx={{ overflow: 'hidden', mb: 4, maxWidth: 600, marginX: 'auto' }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 400,
          overflow: 'hidden',
          '&:hover .photo-credit': {
            opacity: 1,
          },
        }}
      >
        <Image
          src={coverImage.media_url ?? placeholderImage}
          alt={businessName ?? ''}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          style={{ objectFit: 'cover' }}
          quality={80}
          priority={true}
        />
        {coverImage.credits && (
          <Box
            className="photo-credit"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              px: 1.5,
              py: 1,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
              opacity: 0,
              transition: 'opacity 0.25s ease',
              color: 'white',
              fontSize: '0.75rem',
            }}
          >
            {coverImage.credits}
          </Box>
        )}
      </Box>
    </Card>
  );
}
