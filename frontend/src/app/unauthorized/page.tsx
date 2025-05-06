import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';

export default function Unauthorized() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          my: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" paragraph>
          You don&apos;t have permission to access this page. Only administrators can view this content.
        </Typography>
        <Button variant="contained" component={Link} href="/">
          Return to Home
        </Button>
      </Box>
    </Container>
  );
}