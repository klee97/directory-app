import { graphQLClient } from '@/lib/contentful/graphqlClient';
import { GetAllBlogPostsQuery, GetAllBlogPostsDocument, GetBlogPostBySlugQuery, GetBlogPostBySlugDocument } from '@/lib/generated/graphql';
import { unstable_cache } from 'next/cache';
import { NextRequest } from 'next/server';

const CACHE_TTL = 900; // 15 minutes

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
const _getPostBySlug = unstable_cache(
  async (slug: string) => {
    const { pageBlogPostCollection } = await graphQLClient.request<GetBlogPostBySlugQuery>(
      GetBlogPostBySlugDocument,
      { slug }
    );
    return pageBlogPostCollection?.items[0] ?? null;
  },
  ['post-by-slug'],
  { revalidate: CACHE_TTL, tags: ['all-posts'] }
)

export async function getPostBySlug(slug: string) {
  try {
    return await _getPostBySlug(slug)
  } catch (err) {
    console.error(`Error fetching post by slug (${slug}):`, err)
    return null
  }
}

// ─── Helpers ──────────────────────────────────────────────────

export async function isPostInFuture(slug: string): Promise<boolean> {
  try {
    const posts = await getAllPosts()
    const post = posts.find(p => p?.slug === slug)
    if (!post) return false
    return new Date(post.publishedDate) > new Date()
  } catch {
    return false // fail open
  }
}

export function isBlogPreviewAuthorized(request: NextRequest): boolean {
  const basicAuth = request.headers.get('authorization')
  if (!basicAuth) return false
  const [, credentials] = basicAuth.split(' ')
  if (!credentials) return false
  try {
    const [user, pwd] = atob(credentials).split(':')
    return user === 'preview' && pwd === process.env.PREVIEW_PASSWORD
  } catch {
    return false
  }
}