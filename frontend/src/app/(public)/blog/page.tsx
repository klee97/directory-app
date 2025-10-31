import { ArticleTable } from '@/features/blog/components/ArticleTable';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';


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