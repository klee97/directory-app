'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FavoriteTable from '@/features/favorites/components/FavoriteTable';
import { useEffect, useState } from 'react';
import { Vendor } from '@/types/vendor';
import { useRouter } from 'next/navigation';
import { getFavoriteVendors } from '@/features/favorites/api/getUserFavorites';
import { useAuth } from '@/contexts/AuthContext';


export function FavoritesContent() {
  const [favoriteVendors, setFavoriteVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  useEffect(() => {

    if (isAuthLoading) return; // wait for auth to resolve before checking

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    let mounted = true;


    async function loadFavorites() {
      try {
        const favorites = await getFavoriteVendors();
        if (mounted) {
          setFavoriteVendors(favorites);
          setError(null);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        if (mounted) {
          setError(error instanceof Error ? error : new Error('Failed to load favorites'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, [router, isLoggedIn, isAuthLoading]);

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
        {isLoading ? (
          <Typography variant="h6" color="text.secondary">
            Loading your favorites...
          </Typography>
        ) : error ? (
          <Typography variant="h6" color="error">
            Error loading favorites. Please try again later.
          </Typography>
        ) : favoriteVendors.length > 0 ? (
          <FavoriteTable favoriteVendors={favoriteVendors} />
        ) : (
          <Typography variant="h6" color="text.secondary">
            You haven&apos;t added any favorites yet. Browse our vendors to find your perfect match!
          </Typography>
        )}
      </Box>
    </Container>
  );
} 