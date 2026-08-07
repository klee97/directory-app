import { supabaseStaticClient } from './src/lib/supabase/clients/staticClient.ts';

const MIN_VENDORS_FOR_SITEMAP = 1;

export async function fetchVendorSlugs() {
  const { data } = await supabaseStaticClient.from('vendors').select('slug').not('id', 'like', 'TEST-%');;
  return data || [];
}

export async function fetchLocationSlugs() {
  const { data } = await supabaseStaticClient.from('location_slugs')
    .select('slug, vendor_count')
    .gte('vendor_count', MIN_VENDORS_FOR_SITEMAP);
  return data || [];
}

function getPriorityForVendorCount(count) {
  if (count >= 20) return 1.0;
  if (count >= 10) return 0.9;
  if (count >= 5) return 0.8;
  if (count >= 3) return 0.6;
  return 0.5;
}

async function fetchBlogSlugs() {
  try {
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
  } catch {
    return [];
  }
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

    // Override priorities for specific pages
    const priorityMap = {
      '/': 1.0,
      '/blog': 0.7,
      '/about': 0.3,
      '/contact': 0.3,
      '/faq': 0.8
    };

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
    // Only add vendor pages, blog pages, and location pages. Static pages are handled by transform
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

    const locationSlugs = await fetchLocationSlugs();
    const locationPages = locationSlugs.map((location) => ({
      loc: `https://www.asianweddingmakeup.com/${location.slug}`,
      lastmod: new Date().toISOString(),
      priority: getPriorityForVendorCount(location.vendor_count),
      changefreq: config.changefreq,
    }));
    return [...vendorPages, ...blogPages, ...locationPages];
  },
};

export default config;