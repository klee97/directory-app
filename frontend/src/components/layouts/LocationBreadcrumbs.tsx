"use client";

import NextLink from 'next/link';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { generateBreadcrumbSlugs } from '@/lib/location/locationSlugs';

export async function LocationBreadcrumbs({ address }: { address: { city: string | null; state: string | null; country: string | null } }) {
  const crumbs: { label: string; href: string }[] = await generateBreadcrumbSlugs(address)
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
      {crumbs.map((crumb, index) => (
        <Box key={crumb.href} sx={{ display: 'flex', alignItems: 'center' }}>
          <Link component={NextLink}
            href={crumb.href}
            variant="body1"
            color="secondary"
            underline="hover"
          >
            {crumb.label}
          </Link>
          {index < crumbs.length - 1 && (
            <ChevronRightIcon fontSize="small" sx={{ mx: 1 }} />
          )}
        </Box>
      ))}
    </Box>
  );
}


