'use client';

import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FavoriteTable from '@/features/favorites/FavoriteTable';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Vendor } from '@/types/vendor';
import { useRouter } from 'next/navigation';
import { getFavoriteVendors } from '@/features/favorites/api/getUserFavorites';

type SerializedVendor = Omit<Vendor, 'specialties'> & {
  specialties: string[];
};

function transformToVendor(vendor: SerializedVendor): Vendor {
  return {
    ...vendor,
    specialties: new Set(vendor.specialties)
  };
}

export function FavoritesContent() {
  const [favoriteVendors, setFavoriteVendors] = useState<SerializedVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Memoize the transformed vendors to prevent unnecessary re-renders
  const transformedVendors = useMemo(() => 
    favoriteVendors.map(transformToVendor),
    [favoriteVendors]
  );

  useEffect(() => {
    let mounted = true;

    async function loadFavorites() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

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
  }, [router, supabase]);

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
        ) : transformedVendors.length > 0 ? (
          <FavoriteTable favoriteVendors={transformedVendors} />
        ) : (
          <Typography variant="h6" color="text.secondary">
            You haven&apos;t added any favorites yet. Browse our vendors to find your perfect match!
          </Typography>
        )}
      </Box>
    </Container>
  );
} 