import { Grid as SystemGrid } from '@mui/system';
import Grid from '@mui/material/Grid2';
import { VendorCard } from './VendorCard';
import { Vendor } from '@/types/vendor';


export function VendorGrid({
  handleFocus,
  handleBlur,
  focusedCardIndex,
  vendors
}: {
  handleFocus: (index: number) => void,
  handleBlur: () => void,
  focusedCardIndex: number | null,
  vendors: Vendor[]
}) {

  return (
    <SystemGrid container spacing={2} sx={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {vendors.map((vendor, index) => (
        <Grid key={index} size={{ xs: 12, md: 4 }}>
          <VendorCard
            cardData={vendor}
            variant="outlined"
            onFocus={() => handleFocus(0)}
            onBlur={handleBlur}
            tabIndex={0}
            className={focusedCardIndex === 0 ? 'Mui-focused' : ''}
          >
          </VendorCard>
        </Grid>
      ))}
    </SystemGrid>
  );
};