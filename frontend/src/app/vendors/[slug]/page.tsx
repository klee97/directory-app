import { Metadata } from 'next';
import { VendorDetails } from '@/features/business/components/VendorDetails';
import { fetchVendorBySlug } from '@/features/business/api/fetchVendor';
import { notFound } from 'next/navigation';
import { Vendor } from '@/types/vendor';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const vendor : Vendor | null = await fetchVendorBySlug(slug);

  if (!vendor) {
    return { title: 'Vendor Not Found' };
  }

  return {
    title: `${vendor.business_name} - Artist Details`,
    description: `Learn more about ${vendor.business_name} and their services.`,
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
      <VendorDetails vendor={vendor} />
    </div>
  );
}