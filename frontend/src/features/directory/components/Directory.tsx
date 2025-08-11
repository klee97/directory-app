"use client"
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Vendor } from '@/types/vendor';
import FilterableVendorTable from './FilterableVendorTable';
import { Suspense, useEffect, useState } from 'react';
import { getFavoriteVendorIds } from '@/features/favorites/api/getUserFavorites';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LocationResult } from '@/types/location';
import Scroll from './Scroll';
import { FilterTags } from '@/lib/directory/filterTags';


interface DirectoryProps {
  vendors: Vendor[];
  tags: FilterTags;
  selectedLocation?: LocationResult;
}

export function Directory({ vendors, tags, selectedLocation }: DirectoryProps) {
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
      sx={{ display: 'flex', flexDirection: 'column', my: { xs: 4, sm: 8, md: 12 }, gap: 2 }}
    >
      <Scroll showBelow={250} />
      <Typography variant="h2" component="h1" gutterBottom>
        The Best Wedding Makeup Artists for Asian Features {selectedLocation ? `in ${selectedLocation.display_name}` : ''}
      </Typography>
      <Typography>
        Find talented makeup artists and hair stylists who are recommended by the Asian diaspora community.
      </Typography>
      <Suspense fallback={<div>Loading...</div>}>
        <FilterableVendorTable
          vendors={vendors}
          favoriteVendorIds={favoriteVendorIds}
          tags={tags}
          preselectedLocation={selectedLocation}
          useLocationPages={!!selectedLocation}
        />
      </Suspense>
    </Container>
  );
}