"use client";

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { AdminUpdateVendorManagement } from '@/features/admin/components/UpdateVendor';
import { createClient } from '@/lib/supabase/client';
import { checkAdminStatus } from '@/features/admin/api/checkAdminStatus';
import AdminLoadingSpinner from '@/features/admin/components/LoadingSpinner';
import Button from '@mui/material/Button';

export default function UpdateVendor() {
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
      <Button variant="text" href="/admin" color='secondary'>
        Back to Admin Dashboard
      </Button>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'left',
          '& > p': { marginBottom: 2 },
        }}
      >
        <Typography variant="h2" component="h2" gutterBottom>
          Update Vendor
        </Typography>
        <AdminUpdateVendorManagement />
        <br />
      </Box>
    </Container>
  );
}