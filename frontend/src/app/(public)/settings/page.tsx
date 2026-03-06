import { UserSettings } from '@/features/settings/components/UserSettings';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function SettingsPage() {
  return (
    <>
      {process.env.NEXT_PUBLIC_FEATURE_FAVORITES_ENABLED === 'true'
        ? <UserSettings userEmail={undefined} hasPassword={true} />
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