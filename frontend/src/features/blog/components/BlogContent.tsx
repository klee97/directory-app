'use client';

import { useState, useMemo, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import ContentfulImage from '@/components/ui/ContentfulImage';
import { PageBlogPost } from '@/features/blog/api/getBlogPosts';
import { FeaturedPost } from './FeaturedPost';
import { TagFilter, ActiveFilters } from './TagFilter';
import type { FilterGroup } from './ArticleTable';
import { getPostLabels } from './postLabels';

interface BlogContentProps {
  featuredPost: PageBlogPost | null;
  posts: PageBlogPost[];
  filterGroups: FilterGroup[];
  showRefreshButton?: React.ReactNode;
}

function postMatchesFilters(
  post: PageBlogPost,
  activeFilters: ActiveFilters,
): boolean {
  for (const [key, value] of Object.entries(activeFilters)) {
    if (value == null) continue;
    const field = post[key as keyof PageBlogPost];
    if (!Array.isArray(field) || !field.includes(value)) return false;
  }
  return true;
}

function postMatchesSearch(post: PageBlogPost, query: string): boolean {
  const lower = query.toLowerCase();
  if (post.title?.toLowerCase().includes(lower)) return true;
  if (post.shortDescription?.toLowerCase().includes(lower)) return true;
  if (post.author?.name?.toLowerCase().includes(lower)) return true;
  return false;
}

export function BlogContent({ featuredPost, posts, filterGroups, showRefreshButton }: BlogContentProps) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = useCallback((key: string, value: string | null) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleToggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      if (prev) {
        // Collapsing — clear all filters and search
        setActiveFilters({});
        setSearchQuery('');
      }
      return !prev;
    });
  }, []);

  const hasActiveFilter = Object.values(activeFilters).some((v) => v != null);
  const trimmedSearch = searchQuery.trim();
  const isFiltering = hasActiveFilter || trimmedSearch.length > 0;

  const filteredPosts = useMemo(() => {
    if (!isFiltering) return posts;
    const allPosts = featuredPost ? [featuredPost, ...posts] : posts;
    return allPosts.filter((p) => {
      if (!postMatchesFilters(p, activeFilters)) return false;
      if (trimmedSearch && !postMatchesSearch(p, trimmedSearch)) return false;
      return true;
    });
  }, [activeFilters, trimmedSearch, isFiltering, featuredPost, posts]);

  const showFeatured = !isFiltering && featuredPost !== null;

  return (
    <>
      {showRefreshButton}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h1" component="h1">
          Blog
        </Typography>
        <IconButton
          onClick={handleToggleExpanded}
          aria-label={expanded ? 'Close search and filters' : 'Open search and filters'}
          sx={{
            border: '1px solid',
            borderColor: expanded ? 'primary.main' : 'divider',
            color: expanded ? 'primary.main' : 'text.secondary',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
          }}
        >
          {expanded ? <CloseIcon /> : <SearchIcon />}
        </IconButton>
      </Box>
      <TagFilter
        filterGroups={filterGroups}
        activeFilters={activeFilters}
        onChange={handleFilterChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        expanded={expanded}
      />
      {showFeatured && <FeaturedPost post={featuredPost!} />}
      {filteredPosts.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 4 }}>
          No posts found for this filter.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredPosts.map((post) => {
            const labels = getPostLabels(post);
            return (
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
            );
          })}
        </Grid>
      )}
    </>
  );
}
