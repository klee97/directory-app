"use client";

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { AdminAddVendorManagement } from '@/features/profile/admin/components/CreateVendor';
import { createClient } from '@/lib/supabase/client';
import { checkAdminStatus } from '@/features/profile/admin/api/checkAdminStatus';
import AdminLoadingSpinner from '@/features/profile/admin/components/LoadingSpinner';
import Button from '@mui/material/Button';

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
          Add Vendor
        </Typography>
        <AdminAddVendorManagement />
        <br />
      </Box>
    </Container>
  );
}