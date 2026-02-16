"use client";

import NextLink from 'next/link';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export function LocationBreadcrumbs({
  breadcrumbs
}: {
  breadcrumbs: { label: string; href: string }[]
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
      {breadcrumbs.map((crumb, index) => (
        <Box key={crumb.href} sx={{ display: 'flex', alignItems: 'center' }}>
          <Link component={NextLink}
            href={crumb.href}
            variant="body1"
            color="secondary"
            underline="hover"
          >
            {crumb.label}
          </Link>
          {index < breadcrumbs.length - 1 && (
            <ChevronRightIcon fontSize="small" sx={{ mx: 1 }} />
          )}
        </Box>
      ))}
    </Box>
  );
}


