import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Metadata } from 'next';
import defaultImage from '@/assets/photo_website_preview.jpg';
import BeholdWidget from "@behold/react"
import { BEHOLD_IG_FEED_ID } from '@/lib/constants';

export const metadata: Metadata = {
  title: "Our Story - Asian Wedding Makeup in NYC, LA & more",
  description: "Learn why we created this directory of wedding makeup artists skilled in Asian beauty, and discover vetted recommendations from real Asian brides.",
  openGraph: {
    title: 'About — Asian Wedding Makeup in NYC, LA & more',
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
    <Container maxWidth="lg">
      <br />
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'left',
          '& > p': { marginBottom: 2 },
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          Our Story
        </Typography>
        <Typography variant="body1" component="p">
          As Asian Americans, we understand how difficult it is to find wedding artists who know how to highlight your natural beauty.
        </Typography>
        <Typography variant="body1" component="p">
          When Katrina was planning her own wedding in Boston, she struggled to find makeup artists experienced with Asian features.
          Five stars on The Knot doesn&apos;t mean much when the artist has never worked with Asian skin tones or eye shapes.
          As friends and family planned their own weddings, we realized this problem kept coming up again and again in our communities.
        </Typography>
        <Typography variant="body1" component="p">
          That&apos;s why we created this directory of makeup artists recommended for Asian features.
        </Typography>
        <Typography variant="h1" component="h1" gutterBottom>
          Our Mission
        </Typography>
        <Typography variant="body1" component="p">
          We believe every bride deserves to feel radiant on her wedding day, without settling for someone who doesn&apos;t know how to highlight her natural beauty.
          There is an artist out there who will make you feel absolutely stunning, and we&apos;re here to help you find them.
        </Typography>
        <Typography variant="body1" component="p">
          We&apos;re committed to uplifting the Asian community by connecting couples with makeup artists who are not only technically skilled,
          but who truly understand and celebrate Asian beauty. Many of the businesses we feature are Asian-owned, creating a cycle of support within Asian diaspora communities.
        </Typography>
        <Typography variant="h1" component="h1" gutterBottom>
          Our Process
        </Typography>
        <Typography variant="body1" component="p">
          We crowdsource recommendations from real brides and online community groups.
          We also scour the web, scroll Instagram, and comb through Reddit to see which artists are recommended for Asian features by other brides.
          The artists here are recommended by other Asian couples, and we&apos;re excited to share their recommendations with you.
        </Typography>
      </Box>
      <br />
      <Typography variant="h2" component="h2" gutterBottom textAlign="center">
        Check us out on Instagram
      </Typography>
      <br />
      <BeholdWidget feedId={BEHOLD_IG_FEED_ID} />
      <br />
    </Container>
  );
}
