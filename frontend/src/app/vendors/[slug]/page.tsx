import { Metadata } from 'next';
import { VendorDetails } from '@/features/business/components/VendorDetails';
import { fetchVendorBySlug } from '@/features/business/api/fetchVendor';
import { notFound } from 'next/navigation';
import { Vendor } from '@/types/vendor';
import BackButton from '@/components/ui/BackButton';
import defaultImage from '@/assets/placeholder_cover_img.jpeg';

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
      url: `https://asianweddingmakeup.com/vendor/${slug}`,
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
  };
}

export default async function VendorPage({ params }: PageProps) {
  const slug = (await params).slug;
  const vendor = await fetchVendorBySlug(slug);

  if (!vendor) {
    notFound(); // Return 404 if vendor is not found
  }

  return (
    <div>
      <BackButton />
      <VendorDetails vendor={vendor} />
    </div>
  );
}