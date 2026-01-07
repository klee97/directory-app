import { Metadata } from 'next';
import VendorProfile from '@/features/profile/common/components/VendorProfile';
import { getCachedVendor } from '@/lib/vendor/fetchVendors';
import { notFound } from 'next/navigation';
import { Vendor } from '@/types/vendor';
import BackButton from '@/components/ui/BackButton';
import previewImage from '@/assets/website_preview.jpeg';
import { Suspense } from 'react';
import { hasTagByName, VendorSpecialty } from '@/types/tag';
import { getVendorsByDistanceWithFallback } from '@/features/directory/api/searchVendors';
import { SEARCH_RADIUS_MILES_DEFAULT } from '@/types/location';
import { LocationBreadcrumbs } from '@/components/layouts/LocationBreadcrumbs';
import Container from '@mui/material/Container';
import { getDisplayNameWithoutType } from '@/lib/location/locationNames';
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const vendor: Vendor | null = await getCachedVendor(slug);

  if (!vendor) {
    return { title: 'Vendor Not Found' };
  }

  const isHairStylist = hasTagByName(vendor.tags, VendorSpecialty.SPECIALTY_HAIR);
  const specialtyTitle = isHairStylist ? 'Wedding Hair Stylist' : 'Wedding Makeup Artist';
  const locationString = getDisplayNameWithoutType(vendor.city, vendor.state, vendor.country);
  const title = `${vendor.business_name} - Wedding ${vendor.tags
    .filter((tag) => tag.type === 'SERVICE')
    .map((tag) => tag.display_name)
    .join(' & ')
    } Artist for Asian Brides ${locationString && ` in ${locationString}`}`;
  return {
    title: title,
    description: `Book ${vendor.business_name}, a trusted ${specialtyTitle} in ${vendor.metro ?? vendor.metro_region ?? vendor.state ?? vendor.region}, experienced in Asian bridal beauty.\n` + vendor.description,
    openGraph: {
      title: title,
      description: `Book ${vendor.business_name}, a trusted ${specialtyTitle} in ${vendor.metro ?? vendor.metro_region ?? vendor.state ?? vendor.region}, experienced in Asian bridal beauty.\n` + vendor.description,
      url: `https://www.asianweddingmakeup.com/vendors/${slug}`,
      images: [
        {
          url: vendor.cover_image || previewImage.src,
          width: 1200,
          height: 630,
          alt: `${vendor.business_name} Preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: `Book ${vendor.business_name} for expert Asian bridal beauty services.`,
      images: [vendor.cover_image || previewImage.src],
    },
    alternates: {
      canonical: `https://www.asianweddingmakeup.com/vendors/${slug}`,
    },
  };
}

export default async function VendorPage({ params }: PageProps) {
  const slug = (await params).slug;
  const vendor = await getCachedVendor(slug);

  if (!vendor) {
    notFound(); // Return 404 if vendor is not found
  }

  // Get nearby vendors using your existing function
  let nearbyVendors: Vendor[] = [];

  if (vendor.latitude && vendor.longitude) {
    const allNearbyVendors = await getVendorsByDistanceWithFallback(
      vendor.latitude,
      vendor.longitude,
      SEARCH_RADIUS_MILES_DEFAULT,
      10  // Get more results to filter from
    );

    // Filter out the current vendor and sort by premium status
    nearbyVendors = allNearbyVendors
      .filter(v => v.id !== vendor.id)
      .sort((a, b) => Number(b.is_premium) - Number(a.is_premium))
  }

  const address = {
    city: vendor.city,
    state: vendor.state,
    country: vendor.country,
  }

  // Define JSON-LD schema for the vendor
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://www.asianweddingmakeup.com/vendors/${vendor.slug}`,
    "additionalType": "https://schema.org/BeautySalon",
    "name": vendor.business_name,
    "url": `https://www.asianweddingmakeup.com/vendors/${vendor.slug}`,
    "image": vendor.cover_image,
    "provider": {
      "@type": "Organization",
      "name": "Asian Wedding Makeup",
      "url": "https://www.asianweddingmakeup.com/",
    },
    "serviceType": "Hair and Makeup",
    "priceRange": vendor.bridal_hair_price,
    "sameAs": vendor.instagram,
  };

  return (
    <>
      <section>
        {/* Add JSON-LD to your page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* ... */}
      </section>
      <Suspense fallback={<div>Loading...</div>}>
        <BackButton />
        <Container sx={{ py: 4 }}>
          <LocationBreadcrumbs address={address} />
        </Container>
      </Suspense>
      <VendorProfile vendor={vendor} nearbyVendors={nearbyVendors} />
    </>
  );
}