import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Metadata } from 'next';
import defaultImage from '@/assets/placeholder_cover_img.jpeg';
import FavoriteTable from '@/features/favorites/Favorites';
import { unstable_cache } from 'next/cache';
import { fetchAllVendors } from '@/features/directory/api/fetchVendors';

export const metadata: Metadata = {
  title: "Favorite Artists - Asian Wedding Hair & Makeup in NYC, LA & more",
  description: "Browse your favorite wedding vendors from our directory of hair and makeup artists experienced with Asian features.",
  openGraph: {
    title: 'Favorite Artists — Asian Wedding Hair & Makeup in NYC, LA & more',
    description: 'Browse your favorite wedding vendors from our directory of hair and makeup artists experienced with Asian features.',
    url: 'https://www.asianweddingmakeup.com/favorites',
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
    canonical: "https://www.asianweddingmakeup.com/favorites",
  },
};
const getCachedVendors = unstable_cache(fetchAllVendors);


export default async function Favorites() {
  const vendors = await getCachedVendors();

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
          My Favorites
        </Typography>
        {process.env.NODE_ENV === 'development' && (<FavoriteTable favoriteVendors={vendors}/>
        )}
      </Box>
    </Container>
  );
}
