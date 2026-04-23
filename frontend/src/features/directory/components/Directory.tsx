"use client"
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Vendor } from '@/types/vendor';
import FilterableVendorTable from './FilterableVendorTable';
import { useEffect, useState } from 'react';
import { getFavoriteVendorIds } from '@/features/favorites/api/getUserFavorites';
import { usePathname } from 'next/navigation';
import { LocationResult } from '@/types/location';
import Scroll from './Scroll';
import { FilterTags } from '@/lib/directory/filterTags';
import { useAuth } from '@/contexts/AuthContext';


interface DirectoryProps {
  vendors: Vendor[];
  tags: FilterTags;
  selectedLocation?: LocationResult;
}

export function Directory({ vendors, tags, selectedLocation }: DirectoryProps) {
  const [favoriteVendorIds, setFavoriteVendorIds] = useState<string[]>([]);
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  useEffect(() => {
    async function loadFavorites() {
      try {
        if (isLoggedIn) {
          const favoriteVendorIds = await getFavoriteVendorIds();
          setFavoriteVendorIds(favoriteVendorIds);
        } else {
          setFavoriteVendorIds([]); // handles sign-out automatically
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
    loadFavorites();
  }, [pathname, isLoggedIn]);

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
      <FilterableVendorTable
        vendors={vendors}
        favoriteVendorIds={favoriteVendorIds}
        tags={tags}
        preselectedLocation={selectedLocation}
        useLocationPages={!!selectedLocation}
      />
    </Container>
  );
}