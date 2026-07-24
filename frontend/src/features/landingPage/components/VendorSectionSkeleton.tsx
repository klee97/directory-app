import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid2';

const CAROUSEL_CARD_COUNT = 4;
const GRID_CARD_COUNT = 6;

function VendorCardSkeleton({ height = 260 }: { height?: number }) {
  return (
    <Box>
      <Skeleton variant="rounded" sx={{ width: '100%', height, mb: 1 }} />
      <Skeleton variant="text" width="70%" height={24} />
      <Skeleton variant="text" width="45%" height={20} />
    </Box>
  );
}

export function VendorSectionSkeleton() {
  return (
    <Box sx={{ backgroundColor: 'background.paper', py: { xs: 3, md: 10 } }}>
      <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2 }}>
        <Skeleton variant="text" width={340} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" sx={{ mb: 4, maxWidth: 420 }} />

        {/* Mobile / tablet: matches VendorCarousel (horizontal scroll, fixed widths) */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            gap: 2,
            overflow: 'hidden',
            px: 2,
          }}
        >
          {Array.from({ length: CAROUSEL_CARD_COUNT }).map((_, i) => (
            <Box key={i} sx={{ flex: '0 0 auto', width: { xs: 220, sm: 240 } }}>
              <VendorCardSkeleton height={200} />
            </Box>
          ))}
        </Box>

        {/* Desktop: matches the 3-column Grid2 (size md: 4) */}
        <Grid container spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {Array.from({ length: GRID_CARD_COUNT }).map((_, i) => (
            <Grid key={i} size={{ md: 4 }}>
              <VendorCardSkeleton height={260} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}