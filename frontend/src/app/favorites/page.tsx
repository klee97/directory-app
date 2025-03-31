import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Metadata } from 'next';
import defaultImage from '@/assets/website_preview.jpeg';
import FavoriteTable from '@/features/favorites/FavoriteTable';
import { createClient } from "@/lib/supabase/server";
import { getFavoriteVendors } from '@/features/favorites/api/getCustomerFavorites';

export const metadata: Metadata = {
  title: "Favorite Artists - Asian Wedding Hair & Makeup in NYC, LA & more",
  description: "Browse your favorite wedding vendors from our directory of hair and makeup artists experienced with Asian features.",
  openGraph: {
    title: 'Favorite Artists — Asian Wedding Hair & Makeup in NYC, LA & more',
    description: 'Browse your favorite wedding vendors from our directory of hair and makeup artists experienced with Asian features.',
    url: 'https://www.asianweddingmakeup.com/favorites',
    type: 'website',
    siteName: 'Asian Wedding Makeup',
    images: [
      {
        url: defaultImage.src,
        width: 1200,
        height: 630,
        alt: 'Asian Wedding Makeup Preview',
      },
    ],
  },
  alternates: {
    canonical: "https://www.asianweddingmakeup.com/favorites",
  },
};

export default async function Favorites() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const customerId = user?.id; // Get the current user's ID from the session
  const favorites = customerId ? await getFavoriteVendors(customerId) : null;

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
        {/* Favorites not released in prod */}
        {
          process.env.NODE_ENV !== 'development' &&
          <Typography variant="h4">Coming soon...</Typography>
        }
        {/* User not logged in */}
        {
          (process.env.NODE_ENV === 'development' && !user) &&
          <Typography variant="h4">Please login or create an account to view saved vendors.</Typography>
        }
        {/* No favorites */}
        {
          (process.env.NODE_ENV === 'development' && user && favorites?.length == 0) &&
          <Typography variant="h4">You have no vendors saved!</Typography>
        }
        {
          (process.env.NODE_ENV === 'development' && !!user && !!favorites && favorites.length > 0) &&
          <FavoriteTable favoriteVendors={favorites} />
        }
      </Box>
    </Container>
  );
}
