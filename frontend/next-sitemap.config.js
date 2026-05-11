import { supabaseStaticClient } from './src/lib/supabase/clients/staticClient.ts';

export async function fetchVendorSlugs() {
  const { data } = await supabaseStaticClient.from('vendors').select('slug').not('id', 'like', 'TEST-%');;
  return data || [];
}

export async function fetchLocationSlugs() {
  const { data } = await supabaseStaticClient.from('location_slugs').select('slug').not('id', 'like', 'TEST-%');;
  return data || [];
}

async function fetchBlogSlugs() {
  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        query: `
          query {
            pageBlogPostCollection {
              items {
                slug
                publishedDate
              }
            }
          }
        `
      }),
    }
  );

  const { data } = await response.json();
  const posts = data?.pageBlogPostCollection?.items || [];
  return posts
    .filter(post => post?.slug && new Date(post.publishedDate) <= new Date())
    .map(post => post.slug);
}

// Cache location slugs to avoid multiple database calls
let locationSlugsCache = null;

async function getLocationSlugs() {
  if (!locationSlugsCache) {
    locationSlugsCache = await fetchLocationSlugs();
  }
  return locationSlugsCache;
}

const config = {
  siteUrl: 'https://www.asianweddingmakeup.com',
  generateRobotsTxt: true,
  sitemapSize: 500,
  changefreq: 'monthly',
  priority: 0.8,
  exclude: [
    '/admin',
    '/admin/*',
    '/auth/*',
    '/settings',
    '/unauthorized',
    '/forgot-password',
    '/privacy',
    '/favorites',
    '/signup',
    '/login'
  ],

  async transform(config, path) {
    const locationSlugs = await getLocationSlugs();
    const locationSlugSet = new Set(locationSlugs.map(l => `/${l.slug}`));

    // Override priorities for specific pages
    const priorityMap = {
      '/': 1.0,
      '/blog': 0.7,
      '/about': 0.3,
      '/contact': 0.3,
      '/faq': 0.8
    };

    // Check if this is a location page
    if (locationSlugSet.has(path)) {
      return {
        loc: `${config.siteUrl}${path}`,
        lastmod: new Date().toISOString(),
        priority: 0.9,
        changefreq: config.changefreq
      };
    }

    // Check if this is a page with custom priority
    if (priorityMap[path]) {
      return {
        loc: `${config.siteUrl}${path}`,
        lastmod: new Date().toISOString(),
        priority: priorityMap[path],
        changefreq: config.changefreq
      };
    }

    // Return default for all other pages
    return {
      loc: `${config.siteUrl}${path}`,
      lastmod: new Date().toISOString(),
      priority: config.priority,
      changefreq: config.changefreq
    };
  },

  async additionalPaths() {
    // Only add vendor pages since location and static pages are handled by transform
    const vendorData = await fetchVendorSlugs();
    const vendorPages = vendorData.map((vendor) => ({
      loc: `https://www.asianweddingmakeup.com/vendors/${vendor.slug}`,
      lastmod: new Date().toISOString(),
      priority: 0.9,
    }));

    const blogSlugs = await fetchBlogSlugs();
    const blogPages = blogSlugs.map((slug) => ({
      loc: `https://www.asianweddingmakeup.com/blog/${slug}`,
      lastmod: new Date().toISOString(),
      priority: 0.9,
    }));
    return [...vendorPages, ...blogPages];
  },
};

export default config;