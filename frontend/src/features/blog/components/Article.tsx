import { Box, Typography, Container, Avatar } from '@mui/material';
import { PageBlogPost } from '@/features/blog/api/getBlogPosts';
import ContentfulImage from '@/components/ui/ContentfulImage';
import RichText from '@/components/ui/RichText';
export default async function Article({ post }: { post: PageBlogPost | null | undefined }) {
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
        <Typography variant="h3" component="h1" gutterBottom>
          {post.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {post.author?.avatar?.url && (
            <Avatar src={post.author?.avatar?.url} alt={post.author?.name ?? ''} sx={{ mr: 2 }} />
          )}
          <Typography variant="subtitle1">
            {post.author?.name} • {new Date(post.publishedDate).toLocaleDateString()}
          </Typography>
        </Box>
        {post.featuredImage?.url && (
          <Box sx={{ position: 'relative', height: '400px', width: '100%', mb: 4 }}>
            <ContentfulImage
              alt={`Cover Image for ${post.featuredImage.title}`}
              src={post.featuredImage.url}
              caption={post.featuredImage.description}
              fill
              style={{ objectFit: 'contain' }}
            />
          </Box>
        )}
        <Box sx={{ typography: 'body1' }}>
          <RichText content={post.content?.json} />
        </Box>
      </Box>
    </Container>
  );
}