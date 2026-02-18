import { Directory } from '@/features/directory/components/Directory';
import { VendorByDistance } from '@/types/vendor';
import { notFound, redirect } from 'next/navigation';
import defaultImage from '@/assets/website_preview.jpeg';
import { LOCATION_TYPE_CITY, LOCATION_TYPE_COUNTRY, LOCATION_TYPE_STATE, LocationResult, SEARCH_RADIUS_MILES_DEFAULT, SEARCH_VENDORS_LIMIT_DEFAULT } from '@/types/location';
import { Metadata } from 'next';
import { getUniqueVisibleTagNames } from '@/lib/directory/filterTags';
import { supabase } from '@/lib/api-client';
import { getVendorsByCountry, getVendorsByDistanceWithFallback, getVendorsByState } from '@/features/directory/api/fetchVendorsByLocation';
import { LocationPageGenerator } from '@/lib/location/LocationPageGenerator';

interface LocationPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for locations with artists
export async function generateStaticParams() {
  const { data: slugs, error } = await supabase
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

  let vendors: VendorByDistance[] = [];
  if (location.type === LOCATION_TYPE_CITY && location.lat && location.lon) {
    vendors = await getVendorsByDistanceWithFallback(
      location.lat,
      location.lon,
      SEARCH_RADIUS_MILES_DEFAULT,
      SEARCH_VENDORS_LIMIT_DEFAULT
    );
  } else if (location.type === LOCATION_TYPE_STATE) {
    vendors = await getVendorsByState(location);
  } else if (location.type === LOCATION_TYPE_COUNTRY) {
    vendors = await getVendorsByCountry(location);
  }

  // If no location found or no artists, redirect to home table
  if (!vendors || vendors.length === 0) {
    redirect(`/`);
  }

  const uniqueTags = getUniqueVisibleTagNames(vendors);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": vendors.map((vendor, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Local Business",
        "@id": `https://www.asianweddingmakeup.com/vendors/${vendor.slug}`,
        "additionalType": "https://schema.org/BeautySalon",
        "name": vendor.business_name,
        "url": `https://www.asianweddingmakeup.com/vendors/${vendor.slug}`,
        "image": vendor.cover_image?.media_url || defaultImage.src,
        "description": "Trusted wedding makeup artist for Asian features.",
        "areaServed": {
          "@type": "Place",
          "name": location.display_name || "Various Locations"
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
      />
    </>
  );
}

// Metadata for SEO
export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const generator = new LocationPageGenerator();
  const location: LocationResult | null = await generator.getLocationBySlug(slug);
  if (!slug || !location) {
    return {
      title: 'Location Not Found'
    };
  }
  const title = `Asian Wedding Makeup in ${location.display_name} | The Best Artists for Asian Features`;

  return {
    title: title,
    description: `Discover wedding makeup artists in ${location.display_name} experienced with Asian features · Experts in monolids, Asian skin tones, natural makeup & bridal glam`,
    openGraph: {
      title: title,
      description: `Discover wedding makeup artists in ${location.display_name} experienced with Asian features · Experts in monolids, Asian skin tones, natural makeup & bridal glam`,
      url: `https://www.asianweddingmakeup.com/${slug}`,
      type: 'website',
      images: [
        {
          url: defaultImage.src,
          width: 1200,
          height: 630,
          alt: `Asian Wedding Makeup Artists in ${location.display_name}`,
        },
      ],
    },
    alternates: {
      canonical: `https://www.asianweddingmakeup.com/${slug}`,
    },
  };
}