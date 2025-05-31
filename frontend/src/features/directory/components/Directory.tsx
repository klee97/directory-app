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
  tags: string[];
}

export function Directory({ vendors, tags }: DirectoryProps) {
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
        Find Wedding Makeup Artists skilled with Asian Features
      </Typography>
      <Typography>
        Looking for a wedding makeup artist or hair stylist experienced with Asian features? This directory is for you!
      </Typography>
      <Typography>
        Our site features talented makeup artists and hair stylists who are recommended by the Asian diaspora community.
        These artists know how to highlight your natural beauty on your wedding day, and they understand Asian features
        like monolids, olive undertones, and hair texture.
      </Typography>
      <Typography>
        Search by location and specialties, see who travels worldwide for destination weddings, and find the perfect wedding makeup artist in your price range.
      </Typography>
      <Suspense fallback={<div>Loading...</div>}>
        <FilterableVendorTable
          vendors={vendors}
          favoriteVendorIds={favoriteVendorIds}
          tags={tags}
        />
      </Suspense>
    </Container>
  );
}