'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import ContentfulImage from '@/components/ui/ContentfulImage';
import { Carousel } from '@/components/layouts/Carousel';
import { PageBlogPost } from '@/features/blog/api/getBlogPosts';
import { getPostLabels } from './postLabels';
import { formatDateUTC } from '../utils/formatDate';

export function BlogPostCarousel({ posts }: { posts: PageBlogPost[] }) {
  return (
    <Carousel>
      {posts.map((post) => {
        const labels = getPostLabels(post);
        return (
          <Box
            key={post.slug}
            sx={{
              flex: '0 0 auto',
              width: { xs: '85%', sm: 340, md: 360 },
              scrollSnapAlign: 'start',
            }}
          >
            <Link
              href={`/blog/${post.slug}`}
              passHref
              style={{ textDecoration: 'none', display: 'block', height: '100%' }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': { boxShadow: 4 },
                  transition: 'box-shadow 0.2s',
                }}
              >
                {post.featuredImage?.url && (
                  <Box sx={{ position: 'relative', height: 220, width: '100%' }}>
                    <ContentfulImage
                      alt={
                        post.featuredImage.description ??
                        `Cover image for ${post.title}`
                      }
                      src={post.featuredImage.url}
                      fill
                      sizes="(max-width: 600px) 85vw, 360px"
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                  </Box>
                )}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  {labels.length > 0 && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'primary.main',
                      }}
                    >
                      {labels.join(', ')}
                    </Typography>
                  )}
                  <Typography gutterBottom variant="h5" component="h3">
                    {post.title}
                  </Typography>
                  {post.shortDescription && (
                    <Typography variant="body2" color="text.secondary">
                      {post.shortDescription}
                    </Typography>
                  )}
                  {post.publishedDate && (
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ mt: 'auto', pt: 1 }}
                    >
                      {formatDateUTC(post.publishedDate)}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Link>
          </Box>
        );
      })}
    </Carousel>
  );
}
