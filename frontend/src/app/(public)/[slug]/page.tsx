import { Directory } from '@/features/directory/components/Directory';
import { notFound, redirect } from 'next/navigation';
import { LocationResult } from '@/types/location';
import { Metadata } from 'next';
import { LocationPageGenerator } from '@/lib/location/LocationPageGenerator';
import { FilterTags } from '@/lib/directory/filterTags';
import { VendorByDistance } from '@/types/vendor';
import { getLocationPageData } from '@/features/directory/api/fetchVendorsByLocation';
import { LocationFAQ } from '@/features/locationPage/components/LocationFAQ';
import { LocationIntro } from '@/features/locationPage/components/LocationIntro';
import { LocationStats } from '@/lib/location/computeLocationStats';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider/Divider';
import { CollectionPage, ItemList, ListItem } from 'schema-dts';
import { jsonLdGraph, sanitizeJsonLdHtml } from '@/seo/jsonLdHtml';
import { PHOTO_WEBSITE_PREVIEW_URL, ORG_ID, SITE_URL, WEBSITE_ID } from '@/seo/constants';

interface LocationPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

// Page component
export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }
  const generator = new LocationPageGenerator();
  const location: LocationResult | null = await generator.getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  const { vendors, uniqueTags, stats }: { vendors: VendorByDistance[], uniqueTags: FilterTags, stats: LocationStats } = await getLocationPageData(slug, location);

  // If no location found or no artists, redirect to home table
  if (!vendors || vendors.length === 0) {
    redirect(`/`);
  }

  const pageUrl = `${SITE_URL}/${slug}`;

  const collectionPage: CollectionPage = {
    "@type": "CollectionPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: `Wedding Makeup Artists in ${location.display_name}`,
    description: `Browse wedding makeup and hair artists serving ${location.display_name}.`,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    about: { "@type": "Place", name: location.display_name },
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
        description: vendor.description || `Wedding makeup artist serving ${location.display_name}.`,
        areaServed: { "@type": "Place", name: location.display_name || "Various Locations" },
        ...(vendor.city || vendor.state || vendor.country ? {
          address: {
            "@type": "PostalAddress",
            ...(vendor.city && { addressLocality: vendor.city }),
            ...(vendor.state && { addressRegion: vendor.state }),
            ...(vendor.country && { addressCountry: vendor.country }),
          }
        } : {}),
        ...(vendor.latitude != null && vendor.longitude != null && {
          geo: { "@type": "GeoCoordinates", latitude: vendor.latitude, longitude: vendor.longitude }
        }),
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
      <Directory
        vendors={vendors}
        tags={uniqueTags}
        selectedLocation={location}
      >
      </Directory>

      <Box >
        <Container maxWidth="lg">
          <Divider sx={{ my: 6 }} />
          <LocationIntro location={location} stats={stats} />
          <LocationFAQ location={location} stats={stats} />
        </Container>
      </Box>
    </>
  );
}

// Metadata for SEO
export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const generator = new LocationPageGenerator();
  const location: LocationResult | null = await generator.getLocationBySlug(slug);
  if (!slug || !location) {
    return { title: 'Location Not Found' };
  }

  const { stats } = await getLocationPageData(slug, location);

  if (stats.vendorCount === 0) {
    return { title: 'Location Not Found' };
  }

  const title = `Asian Wedding Makeup in ${location.display_name} | ${stats.vendorCount} Artists for Asian Features`;
  const description = `${stats.vendorCount} wedding makeup ${stats.vendorCount === 1 ? 'artist' : 'artists'} near ${location.display_name} experienced with Asian features` +
    (stats.priceRange ? ` · Bridal services from $${stats.priceRange.min}–$${stats.priceRange.max}` : '') +
    ` · Experts in monolids, Asian skin tones & bridal glam`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${slug}`,
      type: 'website',
      images: [{ url: PHOTO_WEBSITE_PREVIEW_URL, alt: `Asian Wedding Makeup Artists in ${location.display_name}` }],
    },
    alternates: { canonical: `${SITE_URL}/${slug}` },
  };
}