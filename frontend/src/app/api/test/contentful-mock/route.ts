import { NextResponse } from 'next/server';

/**
 * Mock Contentful GraphQL endpoint for e2e tests.
 * Only available when NODE_ENV === 'test'.
 */

const MOCK_POSTS = [
  {
    contentfulMetadata: { tags: [{ id: 'featured', name: 'Featured' }] },
    sys: { id: 'test-post-1' },
    title: 'Test Featured Wedding Guide',
    slug: 'test-featured-wedding-guide',
    shortDescription: 'A comprehensive guide to planning your dream wedding.',
    publishedDate: '2026-04-01T00:00:00.000Z',
    categoryList: ['wedding-inspo'],
    cultures: ['chinese'],
    locations: ['california'],
    content: { json: { nodeType: 'document', content: [{ nodeType: 'paragraph', content: [{ nodeType: 'text', value: 'Test content for featured post.', marks: [], data: {} }], data: {} }], data: {} } },
    featuredImage: { url: 'https://via.placeholder.com/800x600', title: 'Test Image', width: 800, height: 600, description: 'Test featured image', contentType: 'image/jpeg' },
    author: { name: 'Test Author', avatar: null },
    seoFields: { pageTitle: 'Test Featured Wedding Guide', pageDescription: 'Test description' },
  },
  {
    contentfulMetadata: { tags: [] },
    sys: { id: 'test-post-2' },
    title: 'Test Bridal Makeup Tips',
    slug: 'test-bridal-makeup-tips',
    shortDescription: 'Expert tips for your wedding day makeup look.',
    publishedDate: '2026-03-15T00:00:00.000Z',
    categoryList: ['cultural-history'],
    cultures: ['korean'],
    locations: ['new-york'],
    content: { json: { nodeType: 'document', content: [{ nodeType: 'paragraph', content: [{ nodeType: 'text', value: 'Test content for bridal tips.', marks: [], data: {} }], data: {} }], data: {} } },
    featuredImage: { url: 'https://via.placeholder.com/800x600', title: 'Test Image 2', width: 800, height: 600, description: 'Test image 2', contentType: 'image/jpeg' },
    author: { name: 'Test Author', avatar: null },
    seoFields: { pageTitle: 'Test Bridal Makeup Tips', pageDescription: 'Test description 2' },
  },
  {
    contentfulMetadata: { tags: [] },
    sys: { id: 'test-post-3' },
    title: 'Test Traditional Ceremony Styles',
    slug: 'test-traditional-ceremony-styles',
    shortDescription: 'Explore traditional wedding ceremony styles from across Asia.',
    publishedDate: '2026-03-01T00:00:00.000Z',
    categoryList: ['wedding-inspo'],
    cultures: ['chinese'],
    locations: ['new-york'],
    content: { json: { nodeType: 'document', content: [{ nodeType: 'paragraph', content: [{ nodeType: 'text', value: 'Test content for ceremony styles.', marks: [], data: {} }], data: {} }], data: {} } },
    featuredImage: { url: 'https://via.placeholder.com/800x600', title: 'Test Image 3', width: 800, height: 600, description: 'Test image 3', contentType: 'image/jpeg' },
    author: { name: 'Test Author 2', avatar: null },
    seoFields: { pageTitle: 'Test Traditional Ceremony Styles', pageDescription: 'Test description 3' },
  },
];

export async function POST(request: Request) {
  const body = await request.json();
  const query = body.query as string;

  // GetAllBlogPosts query
  if (query.includes('pageBlogPostCollection') && !query.includes('$slug')) {
    return NextResponse.json({
      data: {
        pageBlogPostCollection: {
          items: MOCK_POSTS,
        },
      },
    });
  }

  // GetBlogPostBySlug query
  if (query.includes('$slug')) {
    const slug = body.variables?.slug;
    const post = MOCK_POSTS.find((p) => p.slug === slug);
    return NextResponse.json({
      data: {
        pageBlogPostCollection: {
          items: post
            ? [{
                ...post,
                contentfulMetadata: { ...post.contentfulMetadata, concepts: [] },
                content: {
                  ...post.content,
                  links: { assets: { block: [] }, entries: { block: [] } },
                },
              }]
            : [],
        },
      },
    });
  }

  return NextResponse.json({ data: null });
}
