import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
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
            alignItems: 'left',
            backgroundColor: 'background.paper',
            padding: '20px',
            marginTop: '30px',
            borderRadius: '8px',
            boxShadow: 3
          }}
        >
          <Typography variant="h6" component="h2" sx={{ textAlign: 'center' }}>
            Explore More Resources for the Asian Diaspora
          </Typography>
          <Typography variant="body1" paddingTop={2} sx={{ textAlign: 'left' }}>
            We&apos;re excited to bring you blog posts that highlight the richness of the Asian Diaspora.
            We aim to create a space where you can find inspiration, tips, and stories that resonate with your unique experiences.
          </Typography>
          <Typography variant="body1" paddingY={2} sx={{ textAlign: 'left' }}>
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