import ContactUs from "@/app/(public)/contact/page";
import { Metadata } from "next";
import defaultImage from '@/assets/photo_website_preview.jpg';

export const metadata: Metadata = {
  title: "Contact Us | Asian Wedding Makeup",
  description: "Need help with your business profile? Get in touch with us.",
  openGraph: {
    title: 'Contact Us | Asian Wedding Makeup',
    description: "Need help with your business profile? Get in touch with us.",
    url: 'https://www.asianweddingmakeup.com/partner/contact',
    type: 'website',
    images: [
      {
        url: defaultImage.src,
        width: 800,
        height: 421,
        alt: 'Asian Wedding Makeup Preview',
      },
    ],
  },
  alternates: {
    canonical: "https://www.asianweddingmakeup.com/partner/contact",
  },
};

export default function VendorContactUs() {
  return (
    <ContactUs />
  );
}