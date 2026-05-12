import { NextResponse } from 'next/server';
import { isProduction } from "@/lib/env/env";

/**
 * Mock Contentful GraphQL endpoint for e2e tests.
 * Blocked in production. In non-production environments, requires
 * ENABLE_TEST_MOCK_API=true to serve mock data (returns 404 otherwise).
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
  {
    contentfulMetadata: { tags: [] },
    sys: { id: 'test-post-4' },
    title: 'Test Portrait Bridal Shoot',
    slug: 'test-portrait-bridal-shoot',
    shortDescription: 'A stunning portrait bridal photo session.',
    publishedDate: '2026-04-15T00:00:00.000Z',
    categoryList: ['wedding-inspo'],
    cultures: ['vietnamese'],
    locations: ['california'],
    content: { json: { nodeType: 'document', content: [{ nodeType: 'paragraph', content: [{ nodeType: 'text', value: 'Test content for portrait shoot.', marks: [], data: {} }], data: {} }], data: {} } },
    featuredImage: { url: 'https://via.placeholder.com/600x900', title: 'Test Portrait Image', width: 600, height: 900, description: 'Test portrait image', contentType: 'image/jpeg' },
    author: { name: 'Test Author', avatar: null },
    seoFields: { pageTitle: 'Test Portrait Bridal Shoot', pageDescription: 'Test description 4' },
  },
  {
    contentfulMetadata: { tags: [] },
    sys: { id: 'test-post-5' },
    title: 'Test Future Exclusive Preview',
    slug: 'test-future-exclusive-preview',
    shortDescription: 'An exclusive preview of an upcoming collection.',
    publishedDate: '2026-06-01T00:00:00.000Z',
    categoryList: ['wedding-inspo'],
    cultures: ['indian'],
    locations: ['california'],
    content: { json: { nodeType: 'document', content: [{ nodeType: 'paragraph', content: [{ nodeType: 'text', value: 'Test content for future exclusive post.', marks: [], data: {} }], data: {} }], data: {} } },
    featuredImage: { url: 'https://via.placeholder.com/800x600', title: 'Test Future Image', width: 800, height: 600, description: 'Test future image', contentType: 'image/jpeg' },
    author: { name: 'Test Author', avatar: null },
    seoFields: { pageTitle: 'Test Future Exclusive Preview', pageDescription: 'Test description 5' },
  },
];

const isMockEnabled = process.env.ENABLE_TEST_MOCK_API === 'true';

export async function POST(request: Request) {
  if (isProduction() || !isMockEnabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

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
