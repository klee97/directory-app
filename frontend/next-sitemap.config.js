import { supabase } from './src/lib/api-client.ts';

export default {
  siteUrl: 'https://www.asianweddingmakeup.com',
  generateRobotsTxt: true,
  sitemapSize: 200, // Optional: number of URLs per sitemap file
  changefreq: 'monthly', // Optional: frequency of change for pages
  priority: 0.8,
  exclude: [
    '/admin',
    '/admin/*',
    '/auth/*',
  ],

  additionalSitemaps: [
    {
      loc: 'https://www.asianweddingmakeup.com/sitemap-locations.xml',
      lastmod: new Date().toISOString(),
    },
  ],

  // Fetch dynamic URLs (from Supabase in this case)
  async additionalPaths() {
    const staticPages = [
      { slug: '', priority: 1.0 }, // Home page
      { slug: 'blog', priority: 0.9 },
      { slug: 'about', priority: 0.3 },
      { slug: 'contact', priority: 0.3 },
      { slug: 'faq', priority: 0.8 },
    ];
    // Fetch the vendor slugs from Supabase
    const data = await fetchVendorSlugs();
    // Map the slugs to the URLs
    const vendorPages = data.map((vendor) => ({
      loc: `https://www.asianweddingmakeup.com/vendors/${vendor.slug}`,
      lastmod: new Date().toISOString(),
      priority: 0.5,
    }));
    return [...staticPages, ...vendorPages];
  },
};

export async function fetchVendorSlugs() {
  const { data } = await supabase.from('vendors').select('slug');
  return data || [];
}
