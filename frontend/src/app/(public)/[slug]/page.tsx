import { Directory } from '@/features/directory/components/Directory';
import { notFound, redirect } from 'next/navigation';
import defaultImage from '@/assets/website_preview.jpeg';
import { LocationResult } from '@/types/location';
import { Metadata } from 'next';
import { supabaseStaticClient } from '@/lib/supabase/clients/staticClient';
import { LocationPageGenerator } from '@/lib/location/LocationPageGenerator';
import { FilterTags } from '@/lib/directory/filterTags';
import { VendorByDistance } from '@/types/vendor';
import { getLocationPageData } from '@/features/directory/api/fetchVendorsByLocation';
import { LocationFAQ } from '@/features/locationPage/components/LocationFAQ';
import { LocationIntro } from '@/features/locationPage/components/LocationIntro';
import { LocationStats } from '@/lib/location/computeLocationStats';

interface LocationPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

// Generate static params for locations with artists
export async function generateStaticParams() {

  // skip static generation in test
  if (process.env.NODE_ENV === 'test') return [];

  const { data: slugs, error } = await supabaseStaticClient
    .from('location_slugs')
    .select(`
      slug
    `);

  if (error || !slugs) {
    throw new Error('Failed to load location slugs');
  }
  return slugs.map(({
    slug
  }) => ({
    slug
  } as { slug: string }));
}

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.asianweddingmakeup.com/#organization",
        "name": "Asian Wedding Makeup",
        "url": "https://www.asianweddingmakeup.com",
        "description": "A curated directory of wedding makeup and hair artists recommended for the Asian diaspora.",
        "sameAs": ["https://www.instagram.com/asianweddingmkup"],
        "logo": defaultImage.src,
      },
      {
        "@type": "ItemList",
        "itemListElement": vendors.map((vendor, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": ["LocalBusiness", "BeautySalon"],
            "@id": `https://www.asianweddingmakeup.com/vendors/${vendor.slug}`,
            "name": vendor.business_name,
            "url": `https://www.asianweddingmakeup.com/vendors/${vendor.slug}`,
            ...(vendor.cover_image?.media_url && { "image": vendor.cover_image.media_url }),
            "description": vendor.description || `Wedding makeup artist serving ${location.display_name}.`,
            "areaServed": { "@type": "Place", "name": location.display_name || "Various Locations" },
            ...(vendor.city && vendor.state && {
              "address": {
                "@type": "PostalAddress",
                "addressLocality": vendor.city,
                "addressRegion": vendor.state,
                "addressCountry": vendor.country || undefined,
              }
            }),
            ...(vendor.latitude && vendor.longitude && {
              "geo": { "@type": "GeoCoordinates", "latitude": vendor.latitude, "longitude": vendor.longitude }
            }),
          },
        })),
      },
    ],
  };

  return (
    <>
      <section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </section>
      <Directory
        vendors={vendors}
        tags={uniqueTags}
        selectedLocation={location}
      >
        <LocationIntro location={location} stats={stats} />
        <LocationFAQ location={location} stats={stats} />
      </Directory>
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
      url: `https://www.asianweddingmakeup.com/${slug}`,
      type: 'website',
      images: [{ url: defaultImage.src, width: 1200, height: 630, alt: `Asian Wedding Makeup Artists in ${location.display_name}` }],
    },
    alternates: { canonical: `https://www.asianweddingmakeup.com/${slug}` },
  };
}