"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checklist from "@/components/ui/Checklist";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { Diversity3, Edit, Verified } from "@mui/icons-material";

const PERKS = [
  { label: "Verified checkmark", detail: "and better search ranking", icon: <Verified sx={{ fontSize: 24, color: "primary.main" }} /> },
  { label: "Full control", detail: "over your info, photos, and prices", icon: <Edit sx={{ fontSize: 24, color: "primary.main" }} /> },
  { label: "Inquiries from brides", detail: "planning Asian weddings", icon: <Diversity3 sx={{ fontSize: 24, color: "primary.main" }} /> },
];

export default function VendorClaimForm() {

  return (
    <>
      <Typography variant="body1" color="text.primary">
        What you&apos;ll get:
      </Typography>

      <Box sx={{ bgcolor: "grey.100", py: 1, px: 2, my: 2 }} >
        <Checklist items={PERKS} />
        <Typography variant="body2" color="text.primary" sx={{ mt: 1, display: "block" }}>
          <Link component={NextLink} href="/partner" target="_blank" color="inherit" underline="always" >
            Learn more about our directory →
          </Link>
        </Typography>
      </Box>
    </>
  );
}