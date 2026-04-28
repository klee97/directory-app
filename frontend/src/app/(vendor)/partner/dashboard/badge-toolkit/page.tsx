import Container from '@mui/material/Container'
import { BadgesContent } from '@/features/badge-toolkit/components/BadgesContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { redirect } from 'next/navigation';
import { getVendorForCurrentUser } from '@/features/profile/dashboard/api/getVendorForCurrentUser';
import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/getUser';

export const metadata: Metadata = {
  title: 'Vendor Badge Toolkit | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}
export default async function VendorBadgeToolkit() {
  // Check authentication
  const claims = await getCurrentUser();
  if (!claims) {
    redirect(`/partner/login?redirectTo=${encodeURIComponent('/partner/dashboard/badge-toolkit')}`);
  }
  const userId = claims.sub;

  const vendor = await getVendorForCurrentUser(userId);
  if (!vendor) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h2">Artist not found</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          We could not find a badge toolkit for this artist. Please check the URL or contact us for assistance.
        </Typography>
      </Box>
    );
  }

  const baseUrl = 'https://www.asianweddingmakeup.com';
  const vendorUrl = `${baseUrl}/vendors/${vendor.slug}`;
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

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <BadgesContent badges={badges} />
    </Container>
  )
}
