import { getTodaySeed, shuffleVendorsWithSeed } from "@/lib/randomize";
import { getCachedVendors } from "@/lib/vendor/fetchVendors";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { VendorPreviewGrid } from "@/features/directory/components/VendorPreviewGrid";

export const VENDOR_PREVIEW_COUNT = 6;

export async function VendorSection() {

  const vendors = await getCachedVendors();

  // Only show verified vendors with photos on the landing page
  const verifiedVendors = shuffleVendorsWithSeed(
    vendors.filter((v) => v.verified_at != null && v.cover_image != null),
    getTodaySeed()
  ).slice(0, VENDOR_PREVIEW_COUNT);


  if (verifiedVendors.length === 0) return null;

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
        <VendorPreviewGrid vendors={verifiedVendors} />
      </Container>
    </Box>
  );
}