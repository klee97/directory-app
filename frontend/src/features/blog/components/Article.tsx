import { Box, Typography, Container } from '@mui/material';
import { SinglePageBlogPost } from '@/features/blog/api/getBlogPosts';
import RichText from '@/components/ui/RichText';
import PostHeader from './PostHeader';
export default async function Article({ post }: { post: SinglePageBlogPost | null | undefined }) {
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
        <PostHeader post={post} />
        <Box sx={{ typography: 'body1' }}>
          <RichText content={post.content} />
        </Box>
      </Box>
    </Container>
  );
}