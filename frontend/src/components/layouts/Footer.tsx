import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import InstagramIcon from "@mui/icons-material/Instagram";
import { CallToAction } from "./CallToAction";
import KoFiButton from "../ui/KoFiButton";

export const Footer = ({ isVendorFooter }: { isVendorFooter: boolean }) => {
  return (
    <>
      {!isVendorFooter && <CallToAction />}

      <Box
        component="footer"
        sx={{
          mt: 4,
          py: 4,
          px: 2,
          textAlign: "center",
        }}
      >
        {/* Social Media Links */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            mb: 4
          }}
        >
          <KoFiButton />
          <Link
            href="https://www.instagram.com/asianweddingmkup"
            target="_blank"
            rel="noopener"
            underline="none"
          >
            <IconButton color="primary">
              <InstagramIcon fontSize="large" />
            </IconButton>
          </Link>
        </Box>


        <Box sx={{ display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap", mb: 4 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            Home
          </Link>
          <Link href="/about" style={{ color: "inherit", textDecoration: "none" }}>
            About
          </Link>
          <Link href="/partner" style={{ color: "inherit", textDecoration: "none" }}>
            For Vendors
          </Link>
          {isVendorFooter && (<Link href="/partner/contact" style={{ color: "inherit", textDecoration: "none" }}>
            Contact
          </Link>
          )}
          {!isVendorFooter && (
            <>
              <Link href="/contact" style={{ color: "inherit", textDecoration: "none" }}>
                Contact
              </Link>
              <Link href="/faq" style={{ color: "inherit", textDecoration: "none" }}>
                FAQ
              </Link>
              <Link href="/recommend" style={{ color: "inherit", textDecoration: "none" }}>
                Recommend an Artist
              </Link>
              <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>
                Blog
              </Link>
              <Link href="/vendors" style={{ color: "inherit", textDecoration: "none" }}>
                All Vendors
              </Link>
            </>
          )}
          <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
            Privacy Policy
          </Link>
          <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>
            Terms of Service
          </Link>
        </Box>
        {/* Copyright */}
        <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
          © {new Date().getFullYear()} White Rabbit Brides LLC. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}
