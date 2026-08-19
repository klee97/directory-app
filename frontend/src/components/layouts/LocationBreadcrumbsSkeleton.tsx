import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';

export default function BreadcrumbsSkeleton() {
  return (
    <>
      <Box sx={{ py: '6px', px: 1 }}>
        <Skeleton variant="text" width={60} height={25} />
      </Box>
      <Container sx={{ py: 4 }}>
        <Skeleton variant="text" width={280} height={24} sx={{ mb: 2 }} />
      </Container>
    </>
  );
}