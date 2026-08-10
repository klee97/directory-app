import { Metadata } from 'next';
import VendorProfile from '@/features/profile/common/components/VendorProfile';
import { getCachedVendor } from '@/lib/vendor/fetchVendors';
import { notFound } from 'next/navigation';
import { Vendor } from '@/types/vendor';
import BackButton from '@/components/ui/BackButton';
import previewImage from '@/assets/website_preview.jpeg';
import { Suspense } from 'react';
import { hasTagByName, VendorSpecialty } from '@/types/tag';
import { getVendorsByDistanceWithFallback } from '@/features/directory/api/fetchVendorsByLocation';
import { SEARCH_RADIUS_MILES_DEFAULT } from '@/types/location';
import { LocationBreadcrumbs } from '@/components/layouts/LocationBreadcrumbs';
import Container from '@mui/material/Container';
import { getDisplayNameWithoutType } from '@/lib/location/locationNames';
import { generateBreadcrumbSlugs } from '@/lib/location/locationSlugs';
import LoadingPage from '@/components/layouts/LoadingPage';
import { BreadcrumbList, ListItem, LocalBusiness, ProfilePage } from 'schema-dts';
import { jsonLdGraph, sanitizeJsonLdHtml, toAbsoluteUrl, SITE_URL, WEBSITE_ID, ORG_ID } from '@/seo/jsonLdHtml';
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

  const serviceNames = vendor.tags
    .filter((tag) => tag.type === 'SERVICE')
    .map((tag) => tag.display_name);
  const serviceLabel = serviceNames.length ? serviceNames.join(' & ') : 'Makeup';

  const title = `${vendor.business_name} - Wedding ${serviceLabel} Artist for Asian Brides${locationString ? ` in ${locationString}` : ''}`;
  const description = `Book ${vendor.business_name}, a trusted ${specialtyTitle} in ${vendor.metro ?? vendor.metro_region ?? vendor.state ?? vendor.region}, experienced in Asian bridal beauty.\n${vendor.description ?? ''}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/vendors/${slug}`,
      images: [{ url: vendor.cover_image?.media_url
        || toAbsoluteUrl(previewImage.src), width: 1200, height: 630, alt: `${vendor.business_name} Preview` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `Book ${vendor.business_name} for expert Asian bridal beauty services.`,
      images: [vendor.cover_image?.media_url || toAbsoluteUrl(previewImage.src)],
    },
    alternates: { canonical: `${SITE_URL}/vendors/${slug}` },
  };
}

export default async function VendorPage({ params }: PageProps) {
  const slug = (await params).slug;
  const vendor = await getCachedVendor(slug);

  if (!vendor) {
    console.error(`Vendor with slug ${slug} not found in cache.`);
    notFound(); // Return 404 if vendor is not found
  }

  // Get nearby vendors using your existing function
  let nearbyVendors: Vendor[] = [];

  if (vendor.latitude && vendor.longitude) {
    const allNearbyVendors = await getVendorsByDistanceWithFallback(
      vendor.latitude,
      vendor.longitude,
      vendor.country,
      SEARCH_RADIUS_MILES_DEFAULT,
      10  // Get more results to filter from
    );

    // Filter out the current vendor and sort by premium status
    nearbyVendors = allNearbyVendors
      .filter(v => v.id !== vendor.id)
      .sort((a, b) => Number(b.is_premium || b.verified_at) - Number(a.is_premium || a.verified_at))
  }

  const address = {
    city: vendor.city,
    state: vendor.state,
    country: vendor.country,
  }

  const breadcrumbs = await generateBreadcrumbSlugs(address);


  const serviceTags = vendor.tags.filter((t) => t.type === 'SERVICE').map((t) => t.display_name);

  const prices = [vendor.bridal_hair_price, vendor.bridal_makeup_price, vendor.bridal_hair_makeup_price]
    .filter((p): p is number => typeof p === 'number' && p > 0);
  const priceRange = prices.length ? `$${Math.min(...prices)}-$${Math.max(...prices)}` : undefined;

  const vendorUrl = `${SITE_URL}/vendors/${vendor.slug}`;
  const vendorDescription = vendor.description || `Wedding ${serviceTags.join(' & ') || 'makeup'} artist for Asian brides.`;

  const localBusiness: LocalBusiness = {
    "@id": vendorUrl,
    "@type": "BeautySalon",
    name: vendor.business_name || 'Wedding Makeup Artist',
    url: vendorUrl,
    ...(vendor.cover_image?.media_url && { image: vendor.cover_image.media_url }),
    description: vendorDescription,
    ...(serviceTags.length && { serviceType: serviceTags.join(' and ') }),
    ...(priceRange && { priceRange }),
    ...(vendor.instagram && { sameAs: [`https://www.instagram.com/${vendor.instagram}`] }),
    ...(vendor.city && vendor.state && {
      address: {
        "@type": "PostalAddress",
        addressLocality: vendor.city || undefined,
        addressRegion: vendor.state || undefined,
        addressCountry: vendor.country || undefined,
      }
    }),
    ...(vendor.latitude != null && vendor.longitude != null && {
      geo: { "@type": "GeoCoordinates", latitude: vendor.latitude, longitude: vendor.longitude }
    }),
  };

  const breadcrumbList: BreadcrumbList = {
    "@type": "BreadcrumbList",
    "@id": `${vendorUrl}#breadcrumb`,
    itemListElement: [
      ...breadcrumbs.map((crumb, index): ListItem => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        item: `${SITE_URL}${crumb.href}`,
      })),
      {
        "@type": "ListItem",
        position: breadcrumbs.length + 1,
        name: vendor.business_name,
        // Current page — no "item" URL per Google's breadcrumb guidelines.
      } as ListItem,
    ],
  };

  const profilePage: ProfilePage = {
    "@type": "ProfilePage",
    "@id": `${vendorUrl}#webpage`,
    url: vendorUrl,
    name: vendor.business_name || "Wedding Makeup Artist",
    description: vendorDescription,
    mainEntity: { "@id": vendorUrl },
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    breadcrumb: { "@id": `${vendorUrl}#breadcrumb` },
  };

  const jsonLd = jsonLdGraph([localBusiness, breadcrumbList, profilePage]);

  return (
    <>
      <section>
        {/* Add JSON-LD to your page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeJsonLdHtml(jsonLd) }}
        />
        {/* ... */}
      </section>
      <Suspense fallback={<LoadingPage />}>
        <BackButton fallbackHref="/vendors" />
        <Container sx={{ py: 4 }}>
          <LocationBreadcrumbs breadcrumbs={breadcrumbs} />
        </Container>
      </Suspense>
      <VendorProfile vendor={vendor} nearbyVendors={nearbyVendors} />
    </>
  );
}