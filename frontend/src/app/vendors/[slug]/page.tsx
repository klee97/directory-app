import { Metadata } from 'next';
import { VendorDetails } from '@/features/business/components/VendorDetails';
import { fetchVendorBySlug } from '@/features/business/api/fetchVendor';
import { notFound } from 'next/navigation';
import { Vendor } from '@/types/vendor';
import BackButton from '@/components/ui/BackButton';
import previewImage from '@/assets/website_preview.jpeg';
import { Suspense } from 'react';
import { VendorSpecialty } from '@/types/tag';
import { getVendorsByDistanceWithFallback } from '@/features/directory/api/searchVendors';
import { SEARCH_RADIUS_MILES_DEFAULT } from '@/types/location';
import { getLocationString } from '@/lib/location/displayLocation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const vendor: Vendor | null = await fetchVendorBySlug(slug);

  if (!vendor) {
    return { title: 'Vendor Not Found' };
  }

  const isHairStylist = vendor.specialties?.has(VendorSpecialty.SPECIALTY_HAIR);
  const specialtyTitle = isHairStylist ? 'Wedding Hair Stylist' : 'Wedding Makeup Artist';
  const locationString = getLocationString(vendor);
  const title = `${vendor.business_name} - Wedding ${Array.from(vendor.specialties).join(' & ')} Artist for Asian Brides
        ${locationString && ` in ${locationString}`}`;
  return {
    title: title,
    description: `Book ${vendor.business_name}, a trusted ${specialtyTitle} in ${vendor.metro ?? vendor.metro_region ?? vendor.state ?? vendor.region}, experienced in Asian bridal beauty.`,
    openGraph: {
      title: title,
      description: `Book ${vendor.business_name}, a trusted ${specialtyTitle} in ${vendor.metro ?? vendor.metro_region ?? vendor.state ?? vendor.region}, experienced in Asian bridal beauty.`,
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
      title: `${vendor.business_name} - ${specialtyTitle} experienced with Asian features`,
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
  const vendor = await fetchVendorBySlug(slug);

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
    
    // Filter out the current vendor and limit results
    nearbyVendors = allNearbyVendors
      .filter(v => v.id !== vendor.id);
  }

  // Define JSON-LD schema for the vendor
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",  // For a wedding vendor, "Service" may be appropriate
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
      </Suspense>
      <VendorDetails vendor={vendor} nearbyVendors={nearbyVendors}/>
    </>
  );
}