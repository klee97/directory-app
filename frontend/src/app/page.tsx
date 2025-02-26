import { Directory } from '@/features/directory/components/Directory';
import { fetchAllVendors } from '@/features/directory/api/fetchVendors';
import { unstable_cache } from 'next/cache';
import { getTodaySeed, shuffleWithSeed } from '@/lib/randomize';

const getCachedVendors = unstable_cache(fetchAllVendors);

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
          "name": "Wedding Hair and Makeup Directory for Asian Beauty",
          "url": "https://www.asianweddingmakeup.com/",
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
