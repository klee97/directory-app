import { supabase } from './src/lib/api-client.ts';

export default {
  siteUrl: 'https://www.asianweddingmakeup.com',
  generateRobotsTxt: false,
  sitemapBaseFileName: 'sitemap-locations',
  changefreq: 'monthly',
  exclude: ['/**'],

  async additionalPaths() {
    const locationSlugs = await fetchLocationSlugs();
    return (locationSlugs).map((location) => ({
      loc: `https://www.asianweddingmakeup.com/${location.slug}`,
      lastmod: new Date().toISOString(),
      priority: 0.9,
    }));
  }
};


export async function fetchLocationSlugs() {
  const { data } = await supabase.from('location_slugs').select('slug');
  return data || [];
}