import VendorsList from "@/features/directory/components/VendorsList";
import { Metadata } from "next";
import defaultImage from '@/assets/website_preview.jpeg';
import { getCachedVendors } from "@/features/directory/api/fetchVendors";

export const metadata: Metadata = {
  openGraph: {
    title: 'Asian Wedding Makeup - Find artists in NYC, LA, Toronto & more',
    description: 'Find experts in Asian wedding makeup in NYC, LA, Toronto & beyond · Experts in monolids, Asian skin tones & bridal glam · Search by price, skill & location.',
    url: 'https://www.asianweddingmakeup.com/vendors',
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
    canonical: "https://www.asianweddingmakeup.com/vendors",
  },
};

export default async function VendorsPage() {
  const vendors = await getCachedVendors();

  return <VendorsList vendors={vendors} />;
}
