import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { Metadata } from 'next';
import { VendorSection } from '@/features/landingPage/components/VendorSection';
import { BlogSection } from '@/features/landingPage/components/BlogSection';
import type { WebPage } from 'schema-dts';
import { jsonLdGraph, sanitizeJsonLdHtml } from '@/seo/jsonLdHtml';
import { ORG_ID, SITE_URL, WEBSITE_ID, PHOTO_WEBSITE_PREVIEW_URL } from '@/seo/constants';

export const metadata: Metadata = {
  title: 'Asian Wedding Makeup | Trusted Artists for Asian Features',
  description: 'A curated directory of wedding makeup artists experienced with Asian features — recommended by real Asian brides. Read stories, browse verified artists, and find your match.',
  openGraph: {
    title: 'Asian Wedding Makeup | Trusted Artists for Asian Features',
    description: 'A curated directory of wedding makeup artists experienced with Asian features — recommended by real Asian brides.',
    url: SITE_URL,
    type: 'website',
    images: [
      {
        url: PHOTO_WEBSITE_PREVIEW_URL,
        alt: 'Asian Wedding Makeup',
      },
    ],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default async function Home() {
  const webPage: WebPage = {
    "@type": "WebPage",
    "@id": `${SITE_URL}#webpage`,
    url: SITE_URL,
    name: "Asian Wedding Makeup | Trusted Artists for Asian Features",
    description: "A curated directory of wedding makeup and hair artists recommended for the Asian diaspora.",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
  };

  const jsonLd = jsonLdGraph([webPage]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLdHtml(jsonLd) }}
      />

      {/* Hero */}
      <Box sx={{ backgroundColor: 'background.default', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Typography
            variant="h1"
            component="h1"
            sx={{ textAlign: 'center', mb: 2 }}
          >
            Your Home for Asian Weddings
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              fontSize: '1.15rem',
              color: 'text.secondary',
              maxWidth: 640,
              mx: 'auto',
              lineHeight: 1.8,
              mb: 4,
            }}
          >
            As Asian Americans, we know that mainstream wedding resources aren&#39;t always made for us. That&#39;s why
            we made a space of our own. Here, you&#39;ll find hair and makeup artists who understand our features,
            interviews with Asian wedding vendors we love, and ideas for a wedding that honors all of who we are.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link href="/vendors" style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="primary" size="large">
                Find a makeup artist
              </Button>
            </Link>
            <Link href="/about" style={{ textDecoration: 'none' }}>
              <Button variant="outlined" color="primary" size="large">
                Our Story
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* Verified Vendors Preview */}
      <VendorSection />

      {/* Recent Blog Posts */}
      <BlogSection />
    </>
  );
}