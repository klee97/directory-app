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
              vendor={vendor}
              onFocus={() => handleFocus(0)}
              onBlur={handleBlur}
              tabIndex={0}
              className={focusedCardIndex === 0 ? 'Mui-focused' : ''}
              isFavorite={Math.random() < 0.5} //todo: replace with user value
            >
            </VendorCard>
          </Link>
        </Grid>
      ))}
    </SystemGrid>
  );
};