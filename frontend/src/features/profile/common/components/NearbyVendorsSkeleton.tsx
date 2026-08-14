import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography/Typography';

export function NearbyVendorsSkeleton({ resolvedLocation }: { resolvedLocation?: string }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {resolvedLocation
          ? `More wedding makeup artists for Asian features near ${resolvedLocation}`
          : <Skeleton variant="text" width={320} />}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflow: 'hidden',
          px: 2,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              flex: '0 0 auto',
              width: { xs: 220, sm: 240 },
            }}
          >
            <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="50%" />
          </Box>
        ))}
      </Box>
    </Box>
  );
}