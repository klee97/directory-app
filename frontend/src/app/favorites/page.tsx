import { Metadata } from 'next';
import defaultImage from '@/assets/photo_preview.jpg';
import { FavoritesContent } from '@/features/favorites/components/FavoritesContent';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

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
        width: 800,
        height: 421,
        alt: 'Asian Wedding Makeup Preview',
      },
    ],
  },
  alternates: {
    canonical: "https://www.asianweddingmakeup.com/favorites",
  },
};

export default function Favorites() {
  return (
    <>
      {process.env.NEXT_PUBLIC_FEATURE_FAVORITES_ENABLED === 'true'
        ? <FavoritesContent />
        : <Container maxWidth="lg">
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
            <Typography variant="h4">Coming soon...</Typography>
          </Box>
        </Container>
      }
    </>
  )
}
