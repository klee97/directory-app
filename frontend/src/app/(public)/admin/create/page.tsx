"use client";

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AdminAddVendorManagement } from '@/features/profile/admin/components/CreateVendor';
import AdminLoadingSpinner from '@/features/profile/admin/components/LoadingSpinner';
import Button from '@mui/material/Button';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';

export default function AddVendor() {
  const { isLoading } = useRequireAdmin();

  if (isLoading) {
    return (
      <AdminLoadingSpinner />
    );
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