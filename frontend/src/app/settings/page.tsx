import Settings from '@/features/settings/components/Settings';
import { Box, Container, Typography } from '@mui/material';

export default function SettingsPage() {
  return (
    <>
      {process.env.NEXT_PUBLIC_FEATURE_FAVORITES_ENABLED === 'true'
        ? <Settings />
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