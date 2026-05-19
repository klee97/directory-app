import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Divider from '@mui/material/Divider';
import { Metadata } from 'next';
import Image from 'next/image';
import defaultImage from '@/assets/photo_website_preview.jpg';
import katrina1 from '@/assets/katrina_1.jpg';
import katrina2 from '@/assets/katrina_2.jpg';
import BeholdWidget from "@behold/react"
import { BEHOLD_IG_FEED_ID } from '@/lib/constants';

export const metadata: Metadata = {
  title: "Our Story | Asian Wedding Makeup in NYC, LA & more",
  description: "Learn why we created this directory of wedding makeup artists skilled in Asian beauty, and discover vetted recommendations from real Asian brides.",
  openGraph: {
    title: 'Our Story | Asian Wedding Makeup in NYC, LA & more',
    description: 'Learn why we created this directory of wedding makeup artists skilled in Asian beauty, and discover vetted recommendations from real Asian brides.',
    url: 'https://www.asianweddingmakeup.com/about',
    type: 'website',
    siteName: 'Asian Wedding Makeup',
    images: [
      {
        url: defaultImage.src,
        width: 800,
        height: 421,
        alt: 'Asian Wedding Makeup Preview',
      },
    ],
  },
  alternates: {
    canonical: "https://www.asianweddingmakeup.com/about",
  },
};

export default function About() {
  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            component="h1"
            sx={{
              textAlign: 'center',
              mb: 2,
            }}
          >
            Our Story
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              fontSize: '1.1rem',
              color: 'text.secondary',
              maxWidth: 640,
              mx: 'auto',
              lineHeight: 1.8,
            }}
          >
            As Asian Americans, we understand how difficult it is to find wedding artists who know how to highlight your natural beauty.
          </Typography>
        </Container>
      </Box>

      {/* Katrina's Story Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                position: 'relative',
                width: { xs: '50%', sm: '40%', md: '100%' },
                mx: { xs: 'auto', md: 0 },
                aspectRatio: '3 / 4',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Image
                src={katrina2}
                alt="Katrina on her wedding day"
                fill
                sizes="(max-width: 900px) 50vw, 40vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h2" component="h2" gutterBottom>
              Where It Started
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 2.5, lineHeight: 1.8, color: 'text.secondary' }}
            >
              When Katrina was planning her own wedding in Boston, she struggled to find makeup artists experienced with Asian features. Five stars on The Knot doesn&apos;t mean much when the artist has never worked with Asian skin tones or eye shapes.
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 2.5, lineHeight: 1.8, color: 'text.secondary' }}
            >
              As friends and family planned their own weddings, we realized this problem kept coming up again and again in our communities.
            </Typography>
            <Typography
              variant="body1"
              sx={{ lineHeight: 1.8, color: 'text.secondary' }}
            >
              That&apos;s why we created this directory of makeup artists recommended for Asian features.
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* Mission Section */}
      <Box sx={{ backgroundColor: 'background.paper', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }} order={{ xs: 2, md: 1 }}>
              <Typography variant="h2" component="h2" gutterBottom>
                Our Mission
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 2.5, lineHeight: 1.8, color: 'text.secondary' }}
              >
                We believe every bride deserves to feel radiant on her wedding day, without settling for someone who doesn&apos;t know how to highlight her natural beauty. There is an artist out there who will make you feel absolutely stunning, and we&apos;re here to help you find them.
              </Typography>
              <Typography
                variant="body1"
                sx={{ lineHeight: 1.8, color: 'text.secondary' }}
              >
                We&apos;re committed to uplifting the Asian community by connecting couples with makeup artists who are not only technically skilled, but who truly understand and celebrate Asian beauty. Many of the businesses we feature are Asian-owned, creating a cycle of support within Asian diaspora communities.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} order={{ xs: 1, md: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: '60%', sm: '50%', md: '100%' },
                  mx: { xs: 'auto', md: 0 },
                  aspectRatio: '3 / 4',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={katrina1}
                  alt="Katrina getting ready for her wedding"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Process Section */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{ textAlign: 'center', mb: 3 }}
        >
          Our Process
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            lineHeight: 1.8,
            color: 'text.secondary',
            maxWidth: 640,
            mx: 'auto',
          }}
        >
          We crowdsource recommendations from real brides and online community groups. We also scour the web, scroll Instagram, and comb through Reddit to see which artists are recommended for Asian features by other brides. The artists here are recommended by other Asian couples, and we&apos;re excited to share their recommendations with you.
        </Typography>
      </Container>

      {/* Instagram Section */}
      <Box sx={{ backgroundColor: 'background.paper', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Check us out on Instagram
          </Typography>
          <BeholdWidget feedId={BEHOLD_IG_FEED_ID} />
        </Container>
      </Box>
    </>
  );
}
