import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import ContentfulImage from '@/components/ui/ContentfulImage';
import { PageBlogPost } from '@/features/blog/api/getBlogPosts';
import { getPostLabels } from './postLabels';
import { formatDateUTC } from '../utils/formatDate';

interface FeaturedPostProps {
  post: PageBlogPost;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const labels = getPostLabels(post);
  const isLandscape = (post.featuredImage?.width ?? 0) > (post.featuredImage?.height ?? 0);

  const publishedDate = post.publishedDate
    ? formatDateUTC(post.publishedDate)
    : null;

  return (
    <Link href={`/blog/${post.slug}`} passHref style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          display: 'flex',
          flexDirection: isLandscape ? { xs: 'column', md: 'row' } : 'row',
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
              flexShrink: 0,
              ...(isLandscape
                ? {
                    width: { xs: '100%', md: '55%' },
                    aspectRatio: '3 / 2',
                    maxHeight: { xs: '280px', md: '460px' },
                  }
                : {
                    width: { xs: '40%', md: '45%' },
                    minHeight: { xs: '250px', md: '400px' },
                  }),
            }}
          >
            <ContentfulImage
              alt={post.featuredImage.description ?? `Cover image for ${post.title}`}
              src={post.featuredImage.url}
              fill
              priority
              sizes={isLandscape ? '(max-width: 900px) 100vw, 55vw' : '(max-width: 900px) 40vw, 45vw'}
              style={{ objectFit: 'cover', objectPosition: isLandscape ? 'center' : 'center top' }}
            />
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: isLandscape ? { xs: 3, md: 5 } : { xs: 2, md: 5 },
            gap: isLandscape ? 2 : { xs: 1, md: 2 },
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label="Featured" color="primary" size="small" />
            {labels.map((label) => (
              <Chip key={label} label={label} size="small" variant="outlined" />
            ))}
          </Box>

          <Typography
            variant="h2"
            component="h2"
            sx={!isLandscape ? { fontSize: { xs: '1.25rem', sm: '1.5rem', md: undefined } } : undefined}
          >
            {post.title}
          </Typography>

          {post.shortDescription && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={!isLandscape ? {
                display: { xs: '-webkit-box', md: 'block' },
                WebkitLineClamp: { xs: 3, md: 'unset' },
                WebkitBoxOrient: 'vertical',
                overflow: { xs: 'hidden', md: 'visible' },
              } : undefined}
            >
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

          <Button
            component="span"
            variant="contained"
            color="primary"
            sx={{ alignSelf: 'flex-start', mt: 1 }}
          >
            Read Post
          </Button>
        </Box>
      </Card>
    </Link>
  );
}
