import { Navbar } from "@/components/layouts/Navbar";

export default function PreviewLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar isVendorNavbar={false} />
      {children}
    </>
  );
}