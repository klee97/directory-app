import { fetchAllVendors } from "@/features/directory/api/fetchVendors";
import VendorsList from "@/features/directory/components/VendorsList";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import defaultImage from '@/assets/website_preview.jpeg';

const getCachedVendors = unstable_cache(fetchAllVendors);

export const metadata: Metadata = {
  openGraph: {
    title: 'Asian Wedding Makeup - Find artists in NYC, LA & more',
    description: 'Find talented wedding makeup artists in NYC, LA, and more. Discover artists experienced with Asian skin tones, monolids, and hair texture.',
    url: 'https://www.asianweddingmakeup.com/vendors',
    type: 'website',
    images: [
      {
        url: defaultImage.src,
        width: 1200,
        height: 630,
        alt: 'Asian Wedding Makeup Preview',
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
