import { Suspense } from "react";
import type { Metadata } from "next";
import Box from "@mui/system/Box";
import VendorClaimContent from "@/features/vendorClaim/components/VendorClaimContent";
import LoadingPage from "@/components/layouts/LoadingPage";

export const metadata: Metadata = {
  title: "Claim your profile | Asian Wedding Makeup",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VendorClaimPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Box sx={{ bgcolor: "background.back", minHeight: "100vh", display: "flex" }}>
        <VendorClaimContent />
      </Box>
    </Suspense>
  );
}