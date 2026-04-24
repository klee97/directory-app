'use client';

import { useState, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Link from 'next/link';
import ContentfulImage from '@/components/ui/ContentfulImage';
import { PageBlogPost } from '@/features/blog/api/getBlogPosts';
import { FeaturedPost } from './FeaturedPost';
import { TagFilter } from './TagFilter';

interface BlogContentProps {
  featuredPost: PageBlogPost | null;
  posts: PageBlogPost[];
  filterTags: { id: string; name: string }[];
  showRefreshButton?: React.ReactNode;
}

export function BlogContent({ featuredPost, posts, filterTags, showRefreshButton }: BlogContentProps) {
  const [activeTagId, setActiveTagId] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    if (activeTagId === null) return posts;
    const allPosts = featuredPost ? [featuredPost, ...posts] : posts;
    return allPosts.filter((p) =>
      p.contentfulMetadata?.tags?.some((t) => t?.id === activeTagId)
    );
  }, [activeTagId, featuredPost, posts]);

  const showFeatured = activeTagId === null && featuredPost !== null;

  return (
    <>
      {showRefreshButton}
      <TagFilter tags={filterTags} activeTagId={activeTagId} onChange={setActiveTagId} />
      {showFeatured && <FeaturedPost post={featuredPost!} />}
      {filteredPosts.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 4 }}>
          No posts found for this topic.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredPosts.map((post) => (
            <Grid key={post.slug} size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
              <Link
                href={`/blog/${post.slug}`}
                passHref
                style={{ textDecoration: 'none', display: 'block', width: '100%' }}
              >
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
                  {post.featuredImage?.url && (
                    <Box sx={{ position: 'relative', height: '220px', width: '100%' }}>
                      <ContentfulImage
                        alt={
                          post.featuredImage.description ??
                          `Cover image for ${post.featuredImage.title}`
                        }
                        src={post.featuredImage.url}
                        fill
                        sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                      />
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(post.contentfulMetadata?.tags?.filter((t) => t && t.id !== 'featured') ?? []).length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {post.contentfulMetadata!.tags!.filter((t) => t && t.id !== 'featured').map((tag) => (
                          <Box
                            key={tag!.id}
                            component="span"
                            sx={{
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              color: 'primary.main',
                            }}
                          >
                            {tag!.name}
                          </Box>
                        ))}
                      </Box>
                    )}
                    <Typography gutterBottom variant="h5" component="h2">
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.shortDescription}
                    </Typography>
                    {post.publishedDate && (
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 'auto', pt: 1 }}>
                        {new Date(post.publishedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
