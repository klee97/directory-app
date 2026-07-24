import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { getAllPosts, getValidPosts } from '@/features/blog/api/getBlogPosts';
import { BlogPostCarousel } from '@/features/blog/components/BlogPostCarousel';

export const FEATURED_CATEGORIES = ['vendor-spotlight', 'cultural-history', 'vendor-list'] as const;

export async function BlogSection() {
  const posts = await getAllPosts();
  const publishedPosts = getValidPosts(posts).sort(
    (a, b) => new Date(b.publishedDate!).getTime() - new Date(a.publishedDate!).getTime()
  );

  const recentPosts = FEATURED_CATEGORIES
    .map((category) => publishedPosts.find((post) => post.categoryList?.includes(category)))
    .filter((post): post is NonNullable<typeof post> => post != null);

  if (recentPosts.length === 0) return null;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 10 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h2" component="h2" gutterBottom>
            Vendor Stories & Cultural Wedding Guides
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Read stories from our spotlighted vendors, learn cultural histories, and get inspired!
          </Typography>
        </Box>
        <Link href="/blog" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary">
            View all blog posts
          </Button>
        </Link>
      </Box>
      <BlogPostCarousel posts={recentPosts} />
    </Container>
  );
}
