import { Directory } from '@/features/directory/components/Directory';
import { getTodaySeed, shuffleWithSeed } from '@/lib/randomize';
import { Metadata } from 'next';
import defaultImage from '@/assets/website_preview.jpeg';
import { getCachedVendors } from '@/features/directory/api/fetchVendors';
import { getUniqueVisibleTagNames } from '@/lib/directory/filterTags';

export const metadata: Metadata = {
  openGraph: {
    title: 'Asian Wedding Makeup - Find trusted makeup artists in NYC, LA & beyond',
    description: 'Discover wedding makeup artists experienced with Asian features · Experts in monolids, Asian skin tones & bridal glam · Search by price, skill & location.',
    url: 'https://www.asianweddingmakeup.com',
    type: 'website',
    images: [
      {
        url: defaultImage.src,
        width: 1200,
        height: 630,
        alt: 'Asian Wedding Makeup Artist Directory',
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
        "@type": "MakeupArtist",
        "name": vendor.business_name,
        "url": `https://www.asianweddingmakeup.com/vendors/${vendor.slug}`,
        "image": vendor.cover_image,
        "description": "Trusted wedding makeup artist for Asian features.",
        "areaServed": {
          "@type": "Place",
          "name": vendor.region || "Various Locations"
        },
        "provider": {
          "@type": "Organization",
          "name": "Asian Wedding Makeup",
          "url": "https://www.asianweddingmakeup.com",
          "description": "A curated directory of wedding makeup and hair artists recommended for the Asian diaspora.",
          "sameAs": [
            "https://www.instagram.com/asianweddingmkup",
          ],
          "logo": defaultImage.src
        },
      },
    }))
  };

  const uniqueTags = getUniqueVisibleTagNames(vendors);

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
      <title>Asian Wedding Makeup | The Best Artists for Asian Features</title>
      <Directory vendors={shuffledVendors} tags={uniqueTags} />
    </>
  );
}
