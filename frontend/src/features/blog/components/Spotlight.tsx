import { Box, Typography, Container, Button } from '@mui/material';
import { SinglePageBlogPost } from '@/features/blog/api/getBlogPosts';
import RichText from '@/components/ui/RichText';
import SpotlightHeader from './SpotlightHeader';
export default async function Spotlight({ post }: { post: SinglePageBlogPost | null | undefined }) {
  if (!post) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Post not found
          </Typography>
        </Box>
      </Container>
    );
  }
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <SpotlightHeader post={post} />
        <Box sx={{ typography: 'body1' }}>
          <RichText content={post.content} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'background.paper',
            padding: '20px',
            marginTop: '60px',
            borderRadius: '8px',
            boxShadow: 3
          }}
        >
          <Typography variant="h6" component="h2">
            Discover Wedding Makeup Artist Recommended by the Asian Diaspora
          </Typography>
          <Typography variant="body1" paddingY={2} sx={{ textAlign: 'center' }}>
            Stay tuned for more Makeup Artist Spotlights, where we celebrate the
            talented makeup artists in our directory recommended by the Asian diaspora.
          </Typography>

          <Button variant="contained" color="primary" href="/">
            Explore our Directory
          </Button>
        </Box>
      </Box>
    </Container>
  );
}