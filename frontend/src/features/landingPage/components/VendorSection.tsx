import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { Suspense } from "react";
import { VendorGrid } from "./VendorGridData";
import { VendorGridSkeleton } from "./VendorGridSkeleton";

export const VENDOR_PREVIEW_COUNT = 6;

export async function VendorSection() {

  return (
    <Box sx={{ backgroundColor: 'background.paper', py: { xs: 3, md: 10 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h2" component="h2" gutterBottom>
              The Best Makeup Artists for Asian Features
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Find talented makeup artists and hair stylists who are recommended by the Asian diaspora community.
            </Typography>
          </Box>
          <Link href="/vendors" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary">
              Search all artists
            </Button>
          </Link>
        </Box>
        <Suspense fallback={<VendorGridSkeleton />}>
          <VendorGrid />
        </Suspense>
      </Container>
    </Box>
  );
}