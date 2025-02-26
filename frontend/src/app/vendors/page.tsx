import { fetchAllVendors } from "@/features/directory/api/fetchVendors";
import VendorsList from "@/features/directory/components/VendorsList";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import defaultImage from '@/assets/placeholder_cover_img_heart.jpeg';

const getCachedVendors = unstable_cache(fetchAllVendors);

export const metadata: Metadata = {
  openGraph: {
    title: 'Asian Wedding Hair & Makeup - Find artists in NY, LA & more',
    description: 'Find hair and makeup artists recommended for Asian brides. Compare prices, search by location, and book the right artist for you.',
    url: 'https://www.asianweddingmakeup.com/vendors',
    type: 'website',
    images: [
      {
        url: defaultImage.src,
        width: 1200,
        height: 630,
        alt: 'Wedding Vendor Directory Preview',
      },
    ],
  },
  alternates: {
    canonical: "https://www.asianweddingmakeup.com/vendors",
  },
};

export default async function VendorsPage() {
  const vendors = await getCachedVendors();

  return <VendorsList vendors={vendors} />;
}
