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
  // No Navbar or Footer
  return <>{children}</>;
}