import { Directory } from '@/features/directory/components/Directory';
import { fetchAllVendors } from '@/features/directory/api/fetchVendors';
import { unstable_cache } from 'next/cache';
import { getTodaySeed, shuffleWithSeed } from '@/lib/randomize';
import { Metadata } from 'next';
import defaultImage from '@/assets/placeholder_cover_img_heart.jpeg';

const getCachedVendors = unstable_cache(fetchAllVendors);

export const metadata: Metadata = {
  openGraph: {
    title: 'Asian Wedding Hair & Makeup - Find artists in NY, LA & more',
    description: 'Find hair and makeup artists recommended for Asian brides. Compare prices, search by location, and book the right artist for you.',
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
          "name": "Asian Wedding Hair & Makeup – Find artists in NY, LA & more",
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
      <Directory vendors={shuffledVendors} uniqueMetroRegions={uniqueMetroRegions} />
    </>
  );
}
