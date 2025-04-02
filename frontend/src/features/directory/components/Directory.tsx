"use client"
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import { Vendor } from '@/types/vendor';
import FilterableVendorTable from './FilterableVendorTable';
import { Suspense, useEffect, useState } from 'react';
import { getFavoriteVendorIds } from '@/features/favorites/api/getUserFavorites';

interface DirectoryProps {
  vendors: Vendor[];
  uniqueMetroRegions: string[];
}

export function Directory({ vendors, uniqueMetroRegions }: DirectoryProps) {
  const [favoriteVendorIds, setFavoriteVendorIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const favorites = await getFavoriteVendorIds();
        setFavoriteVendorIds(favorites);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFavorites();
  }, []);

  if (isLoading) {
    return <FilterableVendorTable uniqueRegions={uniqueMetroRegions} vendors={vendors} favoriteVendorIds={[]} />;
  }

  return (
    <Container
      maxWidth="lg"
      component="main"
      sx={{ display: 'flex', flexDirection: 'column', my: 12, gap: 4 }}
    >
      <Typography variant="h1" gutterBottom>
        Hair and Makeup Artists for Asian Beauty
      </Typography>
      <Typography>
        Welcome to the Hair and Makeup Directory for Asian Beauty! Discover talented artists who have experience with Asian features and are recommended by the community.
      </Typography>
      <Typography>
        Search by location, see who travels worldwide, and find the perfect artist in your price range.
      </Typography>
      <Suspense fallback={<div>Loading...</div>}>
        <FilterableVendorTable
          uniqueRegions={uniqueMetroRegions}
          vendors={vendors}
          favoriteVendorIds={favoriteVendorIds}
        />
      </Suspense>
    </Container>
  );
}