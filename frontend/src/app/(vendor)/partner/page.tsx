import { Metadata } from "next";
import makeupImage from '@/assets/makeup_palette.jpg';
import VendorLandingPage from '@/features/vendorLandingPage/components/VendorLandingPage';

export const metadata: Metadata = {
  title: "For Vendors - Join Our Curated Directory of Wedding Makeup Artists for Asian Brides",
  description: "Specialize in Asian bridal beauty? Join our trusted directory and connect with brides who value your expertise.",
  openGraph: {
    title: "For Vendors — Join Our Curated Directory of Wedding Makeup Artists for Asian Brides",
    description: "Specialize in Asian bridal beauty? Join our trusted directory and connect with brides who value your expertise.",
    url: "https://www.asianweddingmakeup.com/partner",
    type: "website",
    siteName: "Asian Wedding Makeup",
    images: [
      {
        url: makeupImage.src,
        width: 800,
        height: 421,
        alt: "Asian Wedding Makeup Vendor Preview",
      },
    ],
  },
  alternates: {
    canonical: "https://www.asianweddingmakeup.com/partner",
  },
};

export default function VendorPage() {
  return <VendorLandingPage makeupImage={makeupImage} />;
}