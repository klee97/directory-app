import { Footer } from "@/components/layouts/Footer";
import { Navbar } from "@/components/layouts/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Manage Your Profile - Asian Wedding Makeup',
  robots: 'noindex, nofollow',
};

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return <>
    <Navbar isVendorNavbar={true} />
    {children}
    <Footer isVendorFooter={true} />
  </>;

}