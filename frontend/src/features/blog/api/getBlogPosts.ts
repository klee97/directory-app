import { graphQLClient } from '@/lib/contentful/graphqlClient';
import { GetAllBlogPostsQuery, GetAllBlogPostsDocument, GetBlogPostBySlugQuery, GetBlogPostBySlugDocument } from '@/lib/generated/graphql';

export type PageBlogPost = NonNullable<
  NonNullable<GetAllBlogPostsQuery['pageBlogPostCollection']>['items'][number]
>;

export type SinglePageBlogPost = NonNullable<GetBlogPostBySlugQuery['pageBlogPostCollection']>['items'][number];

export type Content = NonNullable<SinglePageBlogPost>['content'];


export async function getAllPosts() {
  const { pageBlogPostCollection } = await graphQLClient.request<GetAllBlogPostsQuery>(GetAllBlogPostsDocument);
  return pageBlogPostCollection?.items || [];
}

export async function getPostBySlug(slug: string) {
  const { pageBlogPostCollection } = await graphQLClient.request<GetBlogPostBySlugQuery>(
    GetBlogPostBySlugDocument,
    { slug }
  );
  return pageBlogPostCollection?.items[0];
}