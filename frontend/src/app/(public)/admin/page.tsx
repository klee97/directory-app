"use client";

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AdminLoadingSpinner from '@/features/profile/admin/components/LoadingSpinner';
import Button from '@mui/material/Button';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';

export default function Admin() {
  const { isLoading } = useRequireAdmin();

  if (isLoading) {
    return (
      <AdminLoadingSpinner />
    );
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
          gap: 2,
          marginBottom: 8,
        }}
      >
        <Typography variant="h2" component="h2" gutterBottom>
          Admin Dashboard
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 4,
          }}
        >
          <Button color="primary" href="/admin/create" variant="text">
            <Typography variant="body1">
              Add New Vendor
            </Typography>
          </Button>
          <Button color="primary" href="/admin/update" variant="text">
            <Typography variant="body1">
              Update Existing Vendor
            </Typography>
          </Button>
          <Button color="primary" href="/admin/debug" variant="text">
            <Typography variant="body1">
              Debug Environment
            </Typography>
          </Button>
        </Box>
      </Box>
    </Container>
  );
}