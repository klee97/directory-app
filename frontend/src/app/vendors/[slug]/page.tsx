import { Metadata } from 'next';
import { VendorDetails } from '@/features/business/components/VendorDetails';
import { fetchVendorBySlug } from '@/features/business/api/fetchVendor';
import { notFound } from 'next/navigation';
import { Vendor } from '@/types/vendor';
import BackButton from '@/components/ui/BackButton';
import defaultImage from '@/assets/placeholder_cover_img_heart.jpeg';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const vendor: Vendor | null = await fetchVendorBySlug(slug);

  if (!vendor) {
    return { title: 'Vendor Not Found' };
  }

  return {
    title: `${vendor.business_name} - Wedding Beauty Artist`,
    description: `Book ${vendor.business_name} for your wedding. See pricing, portfolio, and contact details.`,
    openGraph: {
      title: `${vendor.business_name} - Wedding Vendor`,
      description: `Book ${vendor.business_name} for your wedding.`,
      url: `https://www.asianweddingmakeup.com/vendors/${slug}`,
      images: [
        {
          url: vendor.cover_image || defaultImage.src,
          width: 1200,
          height: 630,
          alt: `${vendor.business_name} Preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${vendor.business_name} - Wedding Beauty Artist`,
      description: `Book ${vendor.business_name} for your wedding.`,
      images: [vendor.cover_image || defaultImage.src],
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
      <BackButton />
      <VendorDetails vendor={vendor} />
    </>
  );
}