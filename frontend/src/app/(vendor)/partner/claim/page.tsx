import { Suspense } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import type { Metadata } from "next";
import Box from "@mui/system/Box";
import VendorClaimContent from "@/features/vendorClaim/components/VendorClaimContent";

export const metadata: Metadata = {
  title: "Claim your profile | Asian Wedding Makeup",
};

export default function VendorClaimPage() {
  return (
    <Suspense fallback={<CircularProgress size={28} />}>
      <Box sx={{ bgcolor: "background.back", minHeight: "100vh", display: "flex" }}>
        <VendorClaimContent />
      </Box>
    </Suspense>
  );
}