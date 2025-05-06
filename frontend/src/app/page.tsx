import { Directory } from '@/features/directory/components/Directory';
import { fetchAllVendors } from '@/features/directory/api/fetchVendors';
import { unstable_cache } from 'next/cache';
import { getTodaySeed, shuffleWithSeed } from '@/lib/randomize';
import { Metadata } from 'next';
import defaultImage from '@/assets/website_preview.jpeg';

const getCachedVendors = unstable_cache(fetchAllVendors);

export const metadata: Metadata = {
  openGraph: {
    title: 'Asian Wedding Makeup - Trusted artists in NYC, LA & more',
    description: 'Find talented wedding makeup artists in NYC, LA, and more. Discover artists experienced with Asian skin tones, monolids, and hair texture.',
    url: 'https://www.asianweddingmakeup.com',
    type: 'website',
    images: [
      {
        url: defaultImage.src,
        width: 1200,
        height: 630,
        alt: 'Wedding Vendor Directory Preview',
      },
    ],
  },
  alternates: {
    canonical: "https://www.asianweddingmakeup.com",
  },
};

export default async function Home() {
  const vendors = await getCachedVendors();

  // Define JSON-LD schema for the directory
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": vendors.map((vendor, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": vendor.business_name,
        "url": `https://www.asianweddingmakeup.com/vendors/${vendor.slug}`,
        "image": vendor.cover_image,
        "provider": {
          "@type": "Organization",
          "name": "Asian Wedding Makeup – Trusted artists in NYC, LA & more",
          "url": "https://www.asianweddingmakeup.com",
        },
      },
    }))
  };

  // Get unique regions from the vendor data
  const uniqueMetroRegions = Array.from(
    new Set(
      vendors
        .map((vendor) => vendor.metro_region)
        .filter((region): region is string => region !== null && region !== undefined)
        .sort()
    )
  );

  const uniqueTags = Array.from(
    new Set(
      vendors
        .flatMap((vendor) => vendor.tags
        .filter((tag) => tag.is_visible)
        .map((tag) => tag.display_name))
        .sort()
    )
  );

  const seed = getTodaySeed();
  const shuffledVendors = shuffleWithSeed(vendors, seed);

  return (
    <>
      <section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </section>
      <title>Wedding Hair and Makeup Directory for Asian Beauty</title>
      <Directory vendors={shuffledVendors} uniqueMetroRegions={uniqueMetroRegions} tags={uniqueTags} />
    </>
  );
}
