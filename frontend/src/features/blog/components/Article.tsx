import { Box, Typography, Container, Avatar, Divider } from '@mui/material';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Image from 'next/image';
import { PageBlogPost } from '@/features/blog/api/getBlogPosts';
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
          <Box sx={{ position: 'relative', height: '400px', mb: 4 }}>
            <Image src={post.featuredImage?.url} alt={post.title ?? ''} fill style={{ objectFit: 'cover' }} />
          </Box>
        )}
        <Divider sx={{ mb: 4 }} />
        <Box sx={{ typography: 'body1' }}>
          {documentToReactComponents(post.content?.json)}
        </Box>
      </Box>
    </Container>
  );
}