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

      {/* Copyright */}
      <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
        © {new Date().getFullYear()} Hair and Makeup Artists for Asian Beauty. All rights reserved.
      </Typography>
    </Box>
    </>
  );
}
