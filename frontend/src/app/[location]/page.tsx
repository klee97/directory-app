import { Directory } from '@/features/directory/components/Directory';
import { VendorByDistance } from '@/types/vendor';
import { redirect } from 'next/navigation';
import defaultImage from '@/assets/website_preview.jpeg';

// Generate static params for locations with artists
export async function generateStaticParams() {
  const activeLocations = [{ location: "New York", slug: "new-york", type: "city" }];
  // const activeLocations = await db.query(`
  //   WITH active_locations AS (
  //     SELECT DISTINCT 
  //       l.id, l.name, l.slug, l.type, l.parent_id,
  //       COUNT(ma.id) as artist_count
  //     FROM locations l
  //     JOIN makeup_artists ma ON (
  //       ma.location_id = l.id OR 
  //       l.id = ANY(ma.serves_locations)
  //     )
  //     GROUP BY l.id, l.name, l.slug, l.type, l.parent_id
  //   ),
  //   parent_locations AS (
  //     SELECT DISTINCT
  //       p.id, p.name, p.slug, p.type, p.parent_id,
  //       SUM(al.artist_count) as artist_count
  //     FROM locations p
  //     JOIN active_locations al ON al.parent_id = p.id
  //     GROUP BY p.id, p.name, p.slug, p.type, p.parent_id
  //   )
  //   SELECT slug FROM active_locations
  //   UNION
  //   SELECT slug FROM parent_locations
  // `);

  // return activeLocations.map((location) => ({
  //   location: location.slug,
  // }));
  return activeLocations;
}

// Page component
export default async function LocationPage({
  params
}: {
  params: { location: string, slug: string, type: string }
}) {
  const { location, slug: locationSlug } = params;

  const vendorsByLocation: VendorByDistance[] = []; //todo: get vendors
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": vendorsByLocation.map((vendor, index) => ({
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
          "name": location
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
  const uniqueTags = Array.from(
    new Set(
      vendorsByLocation
        .flatMap(vendor => vendor.tags)
        .filter(tag => tag.is_visible)
        .map(tag => tag.display_name)
        .filter(tag => tag !== null)
        .sort()
    )
  );
  // If no location found or no artists, redirect to search
  if (!vendorsByLocation || vendorsByLocation.length === 0) {
    redirect(`/makeup-artists?location=${locationSlug}`);
  }

  // const breadcrumbs = await buildBreadcrumbs(location);

  return (
    <>
      <section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </section>
      <title>Asian Wedding Makeup in {location}| The Best Artists for Asian Features</title>
      <Directory vendors={vendorsByLocation} tags={uniqueTags} />
    </>
  );
}

// Metadata for SEO
export async function generateMetadata({
  params
}: {
  params: { location: string, slug: string }
}) {
  if (!location) {
    return {
      title: 'Location not found',
    };
  }

  return {
    openGraph: {
      title: `Asian Wedding Makeup in ${location} | The Best Artists for Asian Features in ${location}`,
      description: `Discover wedding makeup artists in ${location} experienced with Asian features · Experts in monolids, Asian skin tones & bridal glam · Search by price, skill & location.`,
      url: `https://www.asianweddingmakeup.com/${params.slug}`,
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
      canonical: `https://www.asianweddingmakeup.com/${params.slug}`,
    },
  };
}