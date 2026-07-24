import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid2';
import { VENDOR_PREVIEW_COUNT } from './VendorSection';

const CAROUSEL_CARD_COUNT = 4;

function VendorCardSkeleton({ height = 260 }: { height?: number }) {
  return (
    <Box>
      <Skeleton variant="rounded" sx={{ width: '100%', height, mb: 1 }} />
      <Skeleton variant="text" width="70%" height={24} />
      <Skeleton variant="text" width="45%" height={20} />
    </Box>
  );
}

export function VendorGridSkeleton() {
  return (
    <>
      <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 2, overflow: 'hidden', px: 2 }}>
        {Array.from({ length: CAROUSEL_CARD_COUNT }).map((_, i) => (
          <Box key={i} sx={{ flex: '0 0 auto', width: { xs: 220, sm: 240 } }}>
            <VendorCardSkeleton height={200} />
          </Box>
        ))}
      </Box>

      <Grid container spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
        {Array.from({ length: VENDOR_PREVIEW_COUNT }).map((_, i) => (
          <Grid key={i} size={{ md: 4 }}>
            <VendorCardSkeleton height={260} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}