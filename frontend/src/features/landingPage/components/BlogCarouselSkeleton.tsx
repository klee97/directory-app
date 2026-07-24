import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const BLOG_CARD_COUNT = 3;

function BlogCardSkeleton() {
  return (
    <Box sx={{ flex: '0 0 auto', width: { xs: '85%', sm: 340, md: 360 } }}>
      <Skeleton variant="rounded" sx={{ width: '100%', height: 220, mb: 1 }} />
      <Skeleton variant="text" width="40%" height={16} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="90%" height={28} />
      <Skeleton variant="text" width="70%" height={20} />
    </Box>
  );
}

export function BlogCarouselSkeleton() {
  return (
    <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden', px: 2 }}>
      {Array.from({ length: BLOG_CARD_COUNT }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </Box>
  );
}