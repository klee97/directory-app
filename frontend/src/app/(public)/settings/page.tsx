import { UserSettings } from '@/features/settings/components/UserSettings';
import { getCurrentUser } from '@/lib/auth/getUser';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  // Check authentication
  const claims = await getCurrentUser();

  if (!claims) {
    redirect(`/login?redirectTo=${encodeURIComponent('/settings')}`);
  }

  return (
    <>
      {process.env.NEXT_PUBLIC_FEATURE_FAVORITES_ENABLED === 'true'
        ? <UserSettings userEmail={claims.email} />
        : <Container maxWidth="lg">
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
            <Typography variant="h4">Coming soon...</Typography>
          </Box>
        </Container>
      }
    </>
  );
} 