import { Grid as SystemGrid } from '@mui/system';
import Grid from '@mui/material/Grid2';
import { VendorCard } from './VendorCard';
import { Vendor } from '@/types/vendor';
import Link from 'next/link';


export function VendorGrid({
  handleFocus,
  handleBlur,
  focusedCardIndex,
  vendors,
  searchParams
}: {
  handleFocus: (index: number) => void,
  handleBlur: () => void,
  focusedCardIndex: number | null,
  vendors: Vendor[],
  searchParams: string
}) {

  return (
    <SystemGrid container spacing={2} sx={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {vendors.map((vendor, index) => (
        <Grid key={index} size={{ xs: 12, md: 4 }}>
          <Link
            key={vendor.slug}
            href={`/vendors/${vendor.slug}?${searchParams}`}
            passHref
            style={{ textDecoration: 'none' }}
          >
            <VendorCard
              cardData={vendor}
              variant="outlined"
              onFocus={() => handleFocus(0)}
              onBlur={handleBlur}
              tabIndex={0}
              className={focusedCardIndex === 0 ? 'Mui-focused' : ''}
            >
            </VendorCard>
          </Link>
        </Grid>
      ))}
    </SystemGrid>
  );
};