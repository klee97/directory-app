import { Grid as SystemGrid } from '@mui/system';
import Grid from '@mui/material/Grid2';
import { VendorCard } from './VendorCard';
import { Vendor } from '@/types/vendor';
import Link from 'next/link';
import { fetchCustomerById } from '@/features/business/api/fetchCustomer';
import { createClient } from '@/lib/supabase/client';

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
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // const customerId = user?.id; // Get the current user's ID from the session
  // const customer = null // customerId ? await fetchCustomerById(customerId) : null;
  // const favoriteVendors = customer ? customer.favorite_vendors : new Set();
  // console.log("vendors", vendors)
  const favoriteVendors = new Set<string>();

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
              isFavorite={vendor.id in favoriteVendors}
            >
            </VendorCard>
          </Link>
        </Grid>
      ))}
    </SystemGrid>
  );
};