import { ArticleTable } from '@/features/blog/components/ArticleTable';
import { Box, Typography, Container } from '@mui/material';



export default async function BlogIndex() {

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
          Blog
        </Typography>
        <ArticleTable />

      </Box>
      <br />
    </Container>

  );
}