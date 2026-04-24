'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import ContentfulImage from '@/components/ui/ContentfulImage';
import { RelatedPost } from '@/features/blog/api/getBlogPosts';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const CARD_WIDTH = 280;
const CARD_GAP = 16;

interface RelatedPostsCarouselProps {
  posts: RelatedPost[];
}

export function RelatedPostsCarousel({ posts }: RelatedPostsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, posts]);

  if (posts.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = (CARD_WIDTH + CARD_GAP) * 2;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <Box>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 500 }}>
        Related posts
      </Typography>

      <Box sx={{ position: 'relative' }}>
        {canScrollLeft && (
          <IconButton
            onClick={() => scroll('left')}
            size="small"
            aria-label="Scroll left"
            sx={{
              position: 'absolute',
              left: -18,
              top: '40%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper', boxShadow: 2 },
            }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}

        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: `${CARD_GAP}px`,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            py: 1,
            px: 0.5,
          }}
        >
          {posts.map((post) => (
            <Box
              key={post.slug}
              sx={{
                flexShrink: 0,
                width: `${CARD_WIDTH}px`,
                scrollSnapAlign: 'start',
                borderRadius: 2,
                boxShadow: 3,
                overflow: 'hidden',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                },
              }}
            >
              <Link href={`/blog/${post.slug}`} passHref style={{ textDecoration: 'none' }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 0,
                  }}
                >
                  {post.featuredImage?.url && (
                    <Box sx={{ position: 'relative', height: 160, flexShrink: 0 }}>
                      <ContentfulImage
                        alt={post.featuredImage.description ?? `Cover image for ${post.title}`}
                        src={post.featuredImage.url}
                        fill
                        sizes={`${CARD_WIDTH}px`}
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                      />
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.75, p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography
                      variant="body2"
                      component="h3"
                      sx={{ fontWeight: 500, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {post.title}
                    </Typography>
                    {post.shortDescription && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {post.shortDescription}
                      </Typography>
                    )}
                    {post.publishedDate && (
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 'auto' }}>
                        {new Date(post.publishedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </Box>
          ))}
        </Box>

        {canScrollRight && (
          <IconButton
            onClick={() => scroll('right')}
            size="small"
            aria-label="Scroll right"
            sx={{
              position: 'absolute',
              right: -18,
              top: '40%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper', boxShadow: 2 },
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
