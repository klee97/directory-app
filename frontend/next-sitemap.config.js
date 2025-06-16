import { supabase } from './src/lib/api-client.ts';


export async function fetchVendorSlugs() {
  const { data } = await supabase.from('vendors').select('slug');
  return data || [];
}

export async function fetchLocationSlugs() {
  const { data } = await supabase.from('location_slugs').select('slug');
  return data || [];
}

// Cache location slugs to avoid multiple database calls
let locationSlugsCache = null;

async function getLocationSlugs() {
  if (!locationSlugsCache) {
    locationSlugsCache = await fetchLocationSlugs();
  }
  return locationSlugsCache;
}

export default {
  siteUrl: 'https://www.asianweddingmakeup.com',
  generateRobotsTxt: true,
  sitemapSize: 200,
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
      '/blog': 0.9,
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
      priority: 0.5,
    }));

    return vendorPages;
  },
};