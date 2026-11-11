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
    <Container maxWidth="sm">
      <br />
      <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
        Suggest an Artist
      </Typography>
      <Typography variant="body1" gutterBottom>
        Is there an artist we&apos;re missing that should be listed here? Let us know below!
      </Typography>
      <RecommendationForm />
    </Container>
  );
}
