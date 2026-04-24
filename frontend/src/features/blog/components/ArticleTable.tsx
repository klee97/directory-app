import Box from '@mui/material/Box';
import { getAllPosts } from '@/features/blog/api/getBlogPosts';
import { isDevOrPreview, shouldIncludeFuturePosts } from '@/lib/env/env';
import { RefreshButton } from './RefreshButton';
import { BlogContent } from './BlogContent';

const MINIMUM_TAG_COUNT_FOR_FILTER: number = 3;
const FEATURED_POST_TAG_ID = 'featured';

export async function ArticleTable() {
  const posts = await getAllPosts();
  const validPosts = posts.filter((post): post is NonNullable<typeof post> => {
    if (!post) return false;
    if (!shouldIncludeFuturePosts()) {
      return new Date(post.publishedDate) <= new Date();
    }
    return true;
  });

  const featuredIndex = validPosts.findIndex((p) =>
    p.contentfulMetadata?.tags?.some((t) => t?.id === FEATURED_POST_TAG_ID)
  );
  const featuredPost = featuredIndex !== -1 ? validPosts[featuredIndex] : (validPosts[0] ?? null);
  const remainingPosts =
    featuredIndex !== -1
      ? validPosts.filter((_, i) => i !== featuredIndex)
      : validPosts.slice(1);

  const tagCounts = new Map<string, { name: string; count: number }>();
  for (const post of validPosts) {
    for (const tag of post.contentfulMetadata?.tags ?? []) {
      if (!tag?.id || tag.id === FEATURED_POST_TAG_ID) {
        continue;
      }
      const existing = tagCounts.get(tag.id);
      if (existing) {
        existing.count++;
      } else {
        tagCounts.set(tag.id, { name: tag.name ?? tag.id, count: 1 });
      }
    }
  }
  const filterTags = Array.from(tagCounts.entries())
    .filter(([, { count }]) => count >= MINIMUM_TAG_COUNT_FOR_FILTER)
    .map(([id, { name }]) => ({ id, name }));

  const refreshButton = isDevOrPreview() ? (
    <Box sx={{ mb: 2, display: 'flex' }}>
      <RefreshButton />
    </Box>
  ) : undefined;

  return (
    <BlogContent
      featuredPost={featuredPost}
      posts={remainingPosts}
      filterTags={filterTags}
      showRefreshButton={refreshButton}
    />
  );
}
