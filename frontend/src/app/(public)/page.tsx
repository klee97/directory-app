import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { Metadata } from 'next';
import defaultImage from '@/assets/photo_website_preview.jpg';
import logo from '@/assets/logo.jpeg';
import { getCachedVendors } from '@/lib/vendor/fetchVendors';
import { getTodaySeed, shuffleVendorsWithSeed } from '@/lib/randomize';
import { getAllPosts } from '@/features/blog/api/getBlogPosts';
import { BlogPostCarousel } from '@/features/blog/components/BlogPostCarousel';
import { VendorPreviewGrid } from '@/features/directory/components/VendorPreviewGrid';
import { isPublishedInEasternTime } from '@/lib/dateUtils';

const VENDOR_PREVIEW_COUNT = 6;

export const metadata: Metadata = {
  title: 'Asian Wedding Makeup | Trusted Artists for Asian Features',
  description: 'A curated directory of wedding makeup artists experienced with Asian features — recommended by real Asian brides. Read stories, browse verified artists, and find your match.',
  openGraph: {
    title: 'Asian Wedding Makeup | Trusted Artists for Asian Features',
    description: 'A curated directory of wedding makeup artists experienced with Asian features — recommended by real Asian brides.',
    url: 'https://www.asianweddingmakeup.com',
    type: 'website',
    images: [
      {
        url: defaultImage.src,
        width: 800,
        height: 421,
        alt: 'Asian Wedding Makeup',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.asianweddingmakeup.com',
  },
};

export default async function Home() {
  const [vendors, posts] = await Promise.all([
    getCachedVendors(),
    getAllPosts(),
  ]);

  const verifiedVendors = shuffleVendorsWithSeed(
    vendors.filter((v) => v.verified_at != null && v.cover_image != null),
    getTodaySeed()
  ).slice(0, VENDOR_PREVIEW_COUNT);

  const publishedPosts = posts
    .filter((post): post is NonNullable<typeof post> => {
      if (!post) return false;
      return isPublishedInEasternTime(post.publishedDate);
    })
    .sort(
      (a, b) =>
        new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );

  const FEATURED_CATEGORIES = ['vendor-spotlight', 'cultural-history', 'vendor-list'] as const;
  const recentPosts = FEATURED_CATEGORIES
    .map((category) =>
      publishedPosts.find((post) => post.categoryList?.includes(category))
    )
    .filter((post): post is NonNullable<typeof post> => post != null)
    .sort(
      (a, b) =>
        new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Asian Wedding Makeup',
    url: 'https://www.asianweddingmakeup.com',
    logo: logo.src,
    description:
      'A curated directory of wedding makeup and hair artists recommended for the Asian diaspora.',
    sameAs: ['https://www.instagram.com/asianweddingmkup'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <Box sx={{ backgroundColor: 'background.default', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Typography
            variant="h1"
            component="h1"
            sx={{ textAlign: 'center', mb: 2 }}
          >
            The Best Wedding Makeup Artists for Asian Features
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
            As Asian Americans, we know how hard it is to find hair and makeup artists who understand your features.
            That&#39;s why we&#39;re building a home for Asian wedding planning: community-recommended beauty artists, interviews with Asian wedding vendors, and ideas for a wedding that honors all parts of you.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link href="/directory" style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="primary" size="large">
                Search all artists
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
      {verifiedVendors.length > 0 && (
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
                  Discover the Best Makeup Artists for Asian Features
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Find talented makeup artists and hair stylists who are recommended by the Asian diaspora community.
                </Typography>
              </Box>
              <Link href="/directory" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="primary">
                  Search all artists
                </Button>
              </Link>
            </Box>
            <VendorPreviewGrid vendors={verifiedVendors} />
          </Container>
        </Box>
      )}

      {/* Recent Blog Posts */}
      {recentPosts.length > 0 && (
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 10 } }}>
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
                From Our Blog: Vendor Stories & Cultural Wedding Inspo
              </Typography>
              <Typography variant="body1" color="text.secondary">
                  Read stories from our spotlighted vendors, learn cultural histories, and be inspired!
              </Typography>
          </Box>
            <Link href="/blog" style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="primary">
                View all blog posts
              </Button>
            </Link>
          </Box>
          <BlogPostCarousel posts={recentPosts} />
        </Container>
      )}
    </>
  );
}
