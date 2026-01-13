import Container from '@mui/material/Container'
import { getCachedVendor } from '@/lib/vendor/fetchVendors';
import { BadgesContent } from '@/features/badge-toolkit/components/BadgesContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VendorBadgeToolkit({ params }: PageProps) {
  const slug = (await params).slug;
  const vendor = await getCachedVendor(slug);

  const baseUrl = 'https://www.asianweddingmakeup.com';
  const vendorUrl = `${baseUrl}/vendors/${slug}`;
  const badges = [
    {
      id: 'rectangle',
      label: 'Recommended Artist — Rectangle',
      imageUrl: `/badges/recommended-rectangle.svg`,
      embedCode: `<a href="${vendorUrl}" target="_blank" rel="noopener"><img src="${baseUrl}/badges/recommended-rectangle.svg" alt="Asian Wedding Makeup Recommended Artist" width="300"/></a>`,
    },
    {
      id: 'circle',
      label: 'Recommended Artist – Circle',
      imageUrl: `/badges/recommended-circle.svg`,
      embedCode: `<a href="${vendorUrl}" target="_blank" rel="noopener"><img src="${baseUrl}/badges/recommended-circle.svg" alt="Asian Wedding Makeup Recommended Artist" width="200"/></a>`,
    },
    {
      id: 'award',
      label: 'Recommended Artist – Award',
      imageUrl: `/badges/recommended-award.svg`,
      embedCode: `<a href="${vendorUrl}" target="_blank" rel="noopener"><img src="${baseUrl}/badges/recommended-circle.svg" alt="Asian Wedding Makeup Recommended Artist" width="200"/></a>`,
    },
  ];
  const vendorId = vendor?.id || null;

  if (!vendorId) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h2">Artist not found</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          We could not find a badge toolkit for this artist. Please check the URL or contact us for assistance.
        </Typography>
      </Box>
    );
  }
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <BadgesContent vendor={vendor} badges={badges} />
    </Container>
  )
}
