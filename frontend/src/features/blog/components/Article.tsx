import { Box, Typography, Container, Button } from '@mui/material';
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'background.paper',
            padding: '20px',
            marginTop: '30px',
            borderRadius: '8px',
            boxShadow: 3
          }}
        >
          <Typography variant="h6" component="h2">
            Explore More Wedding Resources for the Asian Diaspora
          </Typography>
          <Typography variant="body1" paddingTop={2} sx={{ textAlign: 'center' }}>
            We&apos;re excited to bring you a series of blog posts that highlights the beauty and history of traditional wedding garments from different cultures.
            The wedding traditions across the Asian diaspora are rich and diverse, and we want to celebrate their beauty.
          </Typography>
          <Typography variant="body1" paddingY={2} sx={{ textAlign: 'center' }}>
            If you&apos;re in search of a makeup artist for your own wedding,
            we also have a directory of talented makeup artists who are experienced with Asian features.
            We hope it makes your wedding planning journey a little easier!
          </Typography>

          <Button variant="contained" color="primary" href="/">
            Find a Makeup Artist
          </Button>
        </Box>
      </Box>
    </Container>
  );
}