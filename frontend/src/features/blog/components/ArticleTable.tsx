import Box from '@mui/material/Box';
import { getAllPosts } from '@/features/blog/api/getBlogPosts';
import { isDevOrPreview, shouldIncludeFuturePosts } from '@/lib/env/env';
import { RefreshButton } from './RefreshButton';
import { BlogContent } from './BlogContent';
import { FILTER_KEY_CATEGORY, FILTER_KEY_CULTURE, FILTER_KEY_LOCATION, FilterKey } from './postLabels';

const FEATURED_POST_TAG_ID = 'featured';

export interface FilterGroup {
  label: string;
  key: FilterKey;
  options: string[];
}

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

  const categorySet = new Set<string>();
  const cultureSet = new Set<string>();
  const locationSet = new Set<string>();

  const isExcluded = (v: string, extra: string[] = []) => {
    const lower = v.toLowerCase();
    return lower === 'uncategorized' || extra.includes(lower);
  };

  for (const post of validPosts) {
    for (const val of post[FILTER_KEY_CATEGORY] ?? []) {
      if (val && !isExcluded(val)) categorySet.add(val);
    }
    for (const val of post[FILTER_KEY_CULTURE] ?? []) {
      if (val && !isExcluded(val, ['general'])) cultureSet.add(val);
    }
    for (const val of post[FILTER_KEY_LOCATION] ?? []) {
      if (val && !isExcluded(val)) locationSet.add(val);
    }
  }

  const allGroups: FilterGroup[] = [
    { label: 'Category', key: FILTER_KEY_CATEGORY, options: Array.from(categorySet).sort() },
    { label: 'Culture', key: FILTER_KEY_CULTURE, options: Array.from(cultureSet).sort() },
    { label: 'Location', key: FILTER_KEY_LOCATION, options: Array.from(locationSet).sort() },
  ];
  const filterGroups = allGroups.filter((g) => g.options.length > 0);

  const refreshButton = isDevOrPreview() ? (
    <Box sx={{ mb: 2, display: 'flex' }}>
      <RefreshButton />
    </Box>
  ) : undefined;

  return (
    <BlogContent
      featuredPost={featuredPost}
      posts={remainingPosts}
      filterGroups={filterGroups}
      showRefreshButton={refreshButton}
    />
  );
}
