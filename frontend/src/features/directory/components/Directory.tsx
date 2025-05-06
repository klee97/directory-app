"use client"
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Vendor } from '@/types/vendor';
import FilterableVendorTable from './FilterableVendorTable';
import { Suspense, useEffect, useState } from 'react';
import { getFavoriteVendorIds } from '@/features/favorites/api/getUserFavorites';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface DirectoryProps {
  vendors: Vendor[];
  uniqueMetroRegions: string[];
}

export function Directory({ vendors, uniqueMetroRegions }: DirectoryProps) {
  const [favoriteVendorIds, setFavoriteVendorIds] = useState<string[]>([]);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function loadFavorites() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const favoriteVendorIds = await getFavoriteVendorIds();
          setFavoriteVendorIds(favoriteVendorIds);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
    loadFavorites();

    // Listen for session changes (e.g., when logging out or logging in)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setFavoriteVendorIds([]);
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => {
      subscription?.unsubscribe();
    };
  }, [pathname, supabase.auth]);

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