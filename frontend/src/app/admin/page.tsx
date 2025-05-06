"use client";

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import AdminVendorManagement from '@/features/admin/components/VendorManagement';
import { createClient } from '@/lib/supabase/client';

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push('/login?redirectTo=/admin');
          return;
        }
        // Check if user is an admin
        const { data: profileData, error: userError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (userError || !profileData || !profileData.is_admin) {
          router.push('/unauthorized');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push('/login?redirectTo=/admin');
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [router, supabase]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
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
        <Typography variant="h1" component="h1" gutterBottom>
          Admin
        </Typography>
        <AdminVendorManagement />
        <br />
      </Box>
    </Container>
  );
}