"use client";

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { AdminAddVendorManagement } from '@/features/admin/components/CreateVendor';
import { createClient } from '@/lib/supabase/client';
import { checkAdminStatus } from '@/features/admin/api/checkAdminStatus';
import AdminLoadingSpinner from '@/features/admin/components/LoadingSpinner';
import Link from 'next/link';

export default function AddVendor() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAdminStatus(supabase, setLoading, setIsAdmin);
  }, [router, supabase]);

  if (loading) {
    return (
      <AdminLoadingSpinner />
    );
  }

  if (!isAdmin) {
    return null; // This shouldn't render as the router.push above should redirect
  }

  return (
    <Container maxWidth="lg">
      <br />
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'left',
          '& > p': { marginBottom: 2 },
        }}
      >
        <Link href="/admin" style={{ color: "inherit", textDecoration: "none" }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Return to Admin Dashboard
          </Typography>
        </Link>
        <Typography variant="h1" component="h1" gutterBottom>
          Add Vendor
        </Typography>
        <AdminAddVendorManagement />
        <br />
      </Box>
    </Container>
  );
}