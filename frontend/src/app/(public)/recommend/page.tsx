import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import RecommendationForm from '@/features/recommendations/components/RecommendationForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recommend an Artist | Asian Wedding Makeup',
  description: 'Know a great HMUA for Asian features? Submit a recommendation and help grow our directory.',
  alternates: {
    canonical: '/recommend',
  },
  openGraph: {
    title: 'Recommend an Artist | Asian Wedding Makeup',
    description: 'Know a great HMUA for Asian features? Submit a recommendation and help grow our directory.',
    url: '/recommend',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function Recommend() {

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
          Suggest an Artist
        </Typography>
        <RecommendationForm />
        <br />
      </Box>
    </Container>
  );
}