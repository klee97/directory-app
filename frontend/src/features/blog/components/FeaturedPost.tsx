import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import ContentfulImage from '@/components/ui/ContentfulImage';
import { PageBlogPost } from '@/features/blog/api/getBlogPosts';
import { getPostLabels } from './postLabels';

interface FeaturedPostProps {
  post: PageBlogPost;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const labels = getPostLabels(post);

  const publishedDate = post.publishedDate
    ? new Date(post.publishedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Link href={`/blog/${post.slug}`} passHref style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          overflow: 'hidden',
          mb: 4,
          '&:hover': { boxShadow: 6 },
          transition: 'box-shadow 0.2s',
        }}
      >
        {post.featuredImage?.url && (
          <Box
            sx={{
              position: 'relative',
              width: { xs: '100%', md: '55%' },
              height: { xs: '260px', md: '460px' },
              flexShrink: 0,
            }}
          >
            <ContentfulImage
              alt={post.featuredImage.description ?? `Cover image for ${post.title}`}
              src={post.featuredImage.url}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 55vw"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: { xs: 3, md: 5 },
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label="Featured" color="primary" size="small" />
            {labels.map((label) => (
              <Chip key={label} label={label} size="small" variant="outlined" />
            ))}
          </Box>

          <Typography variant="h2" component="h2">
            {post.title}
          </Typography>

          {post.shortDescription && (
            <Typography variant="body1" color="text.secondary">
              {post.shortDescription}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {post.author?.name && (
              <Typography variant="body2" color="text.secondary">
                {post.author.name}
              </Typography>
            )}
            {post.author?.name && publishedDate && (
              <Typography variant="body2" color="text.secondary">
                ·
              </Typography>
            )}
            {publishedDate && (
              <Typography variant="body2" color="text.secondary">
                {publishedDate}
              </Typography>
            )}
          </Box>

          <Button variant="contained" color="primary" sx={{ alignSelf: 'flex-start', mt: 1 }}>
            Read Post
          </Button>
        </Box>
      </Card>
    </Link>
  );
}
