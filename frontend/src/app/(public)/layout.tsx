import GlobalStyles from "@mui/material/GlobalStyles";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GlobalStyles
        styles={{
          ".grecaptcha-badge": {
            zIndex: 2147483647,
          },
        }}
      />
      <Navbar isVendorNavbar={false} />
      {children}
      <Footer isVendorFooter={false} />
    </>
  );
}