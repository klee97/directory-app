import { Directory } from '@/features/directory/components/Directory';
import { Metadata } from 'next';
import { getDirectoryPageVendors } from '@/lib/vendor/fetchVendors';
import { CollectionPage, ItemList, ListItem } from 'schema-dts';
import { jsonLdGraph, sanitizeJsonLdHtml } from '@/seo/jsonLdHtml';
import { ORG_ID, SITE_URL, WEBSITE_ID, PHOTO_WEBSITE_PREVIEW_URL } from '@/seo/constants';
import { getDefaultBio } from '@/features/profile/common/utils/bio';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Directory | Asian Wedding Makeup Artists in NYC, Toronto & More',
  description: 'Browse our curated directory of wedding makeup artists experienced with Asian features. Search by price, skill, and location.',
  openGraph: {
    title: 'Directory | Asian Wedding Makeup Artists in NYC, Toronto & More',
    description: 'Discover wedding makeup artists experienced with Asian features · Experts in monolids, Asian skin tones & bridal glam · Search by price, skill & location.',
    url: `${SITE_URL}/vendors`,
    type: 'website',
    images: [
      {
        url: PHOTO_WEBSITE_PREVIEW_URL,
        alt: 'Asian Wedding Makeup Artist Directory',
      },
    ],
  },
  alternates: {
    canonical: `${SITE_URL}/vendors`,
  },
};

export default async function VendorsPage() {
  const { vendors, shuffledVendors, uniqueTags } = await getDirectoryPageVendors();
  const pageUrl = `${SITE_URL}/vendors`;

  const collectionPage: CollectionPage = {
    "@type": "CollectionPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: "Directory | Asian Wedding Makeup Artists in NYC, Toronto & More",
    description: "Browse our curated directory of wedding makeup artists experienced with Asian features. Search by price, skill, and location.",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    mainEntity: { "@id": `${pageUrl}#vendorlist` },
  };

  const itemList: ItemList = {
    "@type": "ItemList",
    "@id": `${pageUrl}#vendorlist`,
    numberOfItems: vendors.length,
    itemListElement: vendors.map((vendor, index): ListItem => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "BeautySalon",
        "@id": `${SITE_URL}/vendors/${vendor.slug}`,
        name: vendor.business_name || "Wedding Makeup Artist",
        url: `${SITE_URL}/vendors/${vendor.slug}`,
        ...(vendor.cover_image?.media_url && { image: vendor.cover_image.media_url }),
        description: vendor.description || getDefaultBio({
          businessName: vendor.business_name,
          tags: vendor.tags,
          location: vendor.city || vendor.state || vendor.country || null,
        }),
        areaServed: {
          "@type": "Place",
          name: vendor.city || vendor.state || vendor.country || "Various Locations",
        },

      },
    })),
  };

  const jsonLd = jsonLdGraph([collectionPage, itemList]);

  return (
    <>
      <section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeJsonLdHtml(jsonLd) }}
        />
      </section>
      <Directory vendors={shuffledVendors} tags={uniqueTags} />
    </>
  );
}
