import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AdminUpdateVendorManagement } from '@/features/profile/admin/components/AdminUpdateVendorManagement';
import Button from '@mui/material/Button';
import { requireAdminForPage } from '@/lib/auth/requireAdminForPage';

export default async function UpdateVendor() {
  await requireAdminForPage('/admin/update');

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