import { supabase } from './src/lib/api-client.ts';

export default {
  siteUrl: 'https://www.asianweddingmakeup.com',
  generateRobotsTxt: true,
  sitemapSize: 200, // Optional: number of URLs per sitemap file
  changefreq: 'monthly', // Optional: frequency of change for pages
  priority: 1.0, // Optional: priority for your pages
  exclude: [
  '/admin',
  '/admin/*',
  '/auth/*',
],

  // Fetch dynamic URLs (from Supabase in this case)
  async additionalPaths() {
    // Fetch the vendor slugs from Supabase
    const data = await fetchVendorSlugs();
    // Map the slugs to the URLs
    return data.map((vendor) => ({
      loc: `https://www.asianweddingmakeup.com/vendors/${vendor.slug}`,
      lastmod: new Date().toISOString(),
      priority: 0.5,
    }));
  },
};

export async function fetchVendorSlugs() {
  try {
    console.log("Fetching vendor slugs");
    const { data } = await supabase.from('vendors')
    .select(`
      slug 
    `);
    if (data === null) {
      return [];
    }
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch vendor slugs.');
  }
}