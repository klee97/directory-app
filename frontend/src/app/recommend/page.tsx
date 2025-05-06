'use client';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import RecommendationForm from '@/features/recommendations/components/RecommendationForm';


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