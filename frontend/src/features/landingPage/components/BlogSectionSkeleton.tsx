import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";

export function BlogSectionSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 10 } }}>
      <Skeleton variant="text" width={360} height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={440} height={24} sx={{ mb: 4 }} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={360} height={220} />
        ))}
      </Box>
    </Container>
  );
}
