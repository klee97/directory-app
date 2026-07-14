import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar isVendorNavbar={false} />
      {children}
      <Footer isVendorFooter={false} />
    </>
  );
}