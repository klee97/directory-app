import { graphQLClient } from '@/lib/contentful/graphqlClient';
import { GetBlogPostStatusDocument, GetBlogPostStatusQuery } from '@/lib/generated/graphql';
import { isPublishedInEasternTime } from '@/lib/dateUtils';

export type BlogPublishStatus = 'published' | 'unpublished' | 'not-found';

export async function getBlogPublishStatus(slug: string): Promise<BlogPublishStatus> {
  const { pageBlogPostCollection } = await graphQLClient.request<GetBlogPostStatusQuery>(
    GetBlogPostStatusDocument,
    { slug }
  );
  const post = pageBlogPostCollection?.items[0];
  if (!post) return 'not-found';
  return isPublishedInEasternTime(post.publishedDate) ? 'published' : 'unpublished';
}