import { graphQLClient } from '@/lib/contentful/graphqlClient';
import { GetAllBlogPostsQuery, GetAllBlogPostsDocument, GetBlogPostBySlugQuery, GetBlogPostBySlugDocument } from '@/lib/generated/graphql';
import { isPublishedInEasternTime } from '@/lib/dateUtils';
import { unstable_cache } from 'next/cache';

const CACHE_TTL = 21600; // 6 hours

export type PageBlogPost = NonNullable<
  NonNullable<GetAllBlogPostsQuery['pageBlogPostCollection']>['items'][number]
>;

export type SinglePageBlogPost = NonNullable<GetBlogPostBySlugQuery['pageBlogPostCollection']>['items'][number];

export type Content = NonNullable<SinglePageBlogPost>['content'];

const _getAllPosts = unstable_cache(
  async () => {
    const { pageBlogPostCollection } = await graphQLClient.request<GetAllBlogPostsQuery>(GetAllBlogPostsDocument);
    return pageBlogPostCollection?.items || [];
  },
  ['all-posts'],
  { revalidate: CACHE_TTL, tags: ['all-posts'] }
)

export async function getAllPosts() {
  try {
    return await _getAllPosts()
  } catch (err) {
    console.error('Error fetching all posts:', err)
    return []
  }
}

/**
 * Filters a list of posts down to the ones that should be shown publicly:
 * drops null entries and any post whose publish date hasn't passed in Eastern Time
 * (keeps future-dated / scheduled posts hidden until they go live).
 */
export function getValidPosts(posts: (PageBlogPost | null)[]): PageBlogPost[] {
  return posts.filter((post): post is PageBlogPost => {
    if (!post) return false;
    return isPublishedInEasternTime(post.publishedDate);
  });
}

const _getPostBySlug = (slug: string) => unstable_cache(
  async () => {
    const { pageBlogPostCollection } = await graphQLClient.request<GetBlogPostBySlugQuery>(
      GetBlogPostBySlugDocument,
      { slug }
    );
    return pageBlogPostCollection?.items[0] ?? null;
  },
  [`post-by-slug-${slug}`],
  { revalidate: 300, tags: ['all-posts'] }
);

export async function getPostBySlug(slug: string) {
  try {
    return await _getPostBySlug(slug)();
  } catch (err) {
    console.error(`Error fetching post by slug (${slug}):`, err)
    return null
  }
}

// ─── Helpers ──────────────────────────────────────────────────

export async function isPostInFuture(slug: string): Promise<boolean> {
  try {
    const post = await getPostBySlug(slug)
    if (!post || !post.publishedDate) {
      return false
    }
    return new Date(post.publishedDate) > new Date()
  } catch {
    return false // fail open
  }
}
