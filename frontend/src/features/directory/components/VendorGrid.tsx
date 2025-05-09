import { Grid as SystemGrid } from '@mui/system';
import Grid from '@mui/material/Grid2';
import { VendorCard } from './VendorCard';
import { Vendor, VendorId } from '@/types/vendor';

export function VendorGrid({
  handleFocus,
  handleBlur,
  focusedCardIndex,
  vendors,
  searchParams,
  favoriteVendorIds,
  showFavoriteButton = false
}: {
  handleFocus: (index: number) => void,
  handleBlur: () => void,
  focusedCardIndex: number | null,
  vendors: Vendor[],
  searchParams: string,
  favoriteVendorIds: VendorId[],
  showFavoriteButton?: boolean
}) {
  return (
    <SystemGrid container spacing={2} sx={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {vendors.map((vendor, index) => (
        <Grid key={index} size={{ xs: 12, md: 4 }}>
          <VendorCard
            key={vendor.slug}
            searchParams={searchParams}
            vendor={vendor}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            positionIndex={index}
            tabIndex={0}
            className={focusedCardIndex === index ? 'Mui-focused' : ''}
            isFavorite={favoriteVendorIds.includes(vendor.id)}
            showFavoriteButton={showFavoriteButton}
          >
          </VendorCard>
        </Grid>
      ))}
    </SystemGrid>
  );
};