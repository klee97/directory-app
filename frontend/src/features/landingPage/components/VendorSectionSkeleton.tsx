import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { VENDOR_PREVIEW_COUNT } from './VendorSection';
import Skeleton from '@mui/material/Skeleton';

export function VendorSectionSkeleton() {
  return (
    <Box sx={{ backgroundColor: 'background.paper', py: { xs: 3, md: 10 } }}>
      <Container maxWidth="lg">
        <Skeleton variant="text" width={340} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={420} height={24} sx={{ mb: 4 }} />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {Array.from({ length: VENDOR_PREVIEW_COUNT }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width={280} height={320} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}