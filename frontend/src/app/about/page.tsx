import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Metadata } from 'next';
import defaultImage from '@/assets/placeholder_cover_img.jpeg';

export const metadata: Metadata = {
  title: "About - Asian Wedding Hair & Makeup in NYC, LA & more",
  description: "Learn more about our mission to connect Asian brides with experienced hair and makeup artists for their weddings",
  openGraph: {
    title: 'About — Asian Wedding Hair & Makeup in NYC, LA & more',
    description: 'Learn more about our mission to connect Asian brides with experienced hair and makeup artists for their wedding',
    url: 'https://www.asianweddingmakeup.com/about',
    type: 'website',
    siteName: 'Asian Wedding Hair & Makeup',
    images: [
      {
        url: defaultImage.src,
        width: 1200,
        height: 630,
        alt: 'Wedding Vendor Directory Preview',
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
          About Us
        </Typography>
        <Typography variant="body1" component="p">
          As two Asian American women, we understand how difficult it is to find wedding artists who know how to highlight your natural beauty.
          A makeup artist who is an experienced professional is not necessarily experienced with Asian features or styles of makeup.
        </Typography>
        <Typography variant="body1" component="p">
          We&apos;re building this directory to help Asian couples find artists who are recommended within their local communities.
          We&apos;re asking our friends and family, scouring the web, scrolling Instagram, and looking through Reddit and Facebook, so you don&apos;t have to.
          The artists here are people who other couples have recommended, and we&apos;re excited to share their recommendations with you.
        </Typography>
        <Typography variant="body1" component="p">
          Whether you&apos;re a vendor looking to showcase your work or a couple planning your big day, we&apos;re here to help.
        </Typography>
        <br />
      </Box>
    </Container>
  );
}
