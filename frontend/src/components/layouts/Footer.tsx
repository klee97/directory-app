import { Box, Typography, Link, IconButton } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import { CallToAction } from "./CallToAction";
export function Footer() {
  return (
    <>
      <CallToAction />

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
        <Typography variant="body2" sx={{ mb: 1 }}>
          Follow us on Instagram
        </Typography>
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

        <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            Home
          </Link>
          <Link href="/about" style={{ color: "inherit", textDecoration: "none" }}>
            About
          </Link>
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
          {/* Add more links here as needed */}
        </Box>
        {/* Copyright */}
        <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
          © {new Date().getFullYear()} Hair and Makeup Artists for Asian Beauty. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}
