import { getTodaySeed, shuffleVendorsWithSeed } from "@/lib/randomize";
import { getCachedVendors } from "@/lib/vendor/fetchVendors";
import { VENDOR_PREVIEW_COUNT } from "./VendorSection";
import { VendorPreviewGrid } from "@/features/directory/components/VendorPreviewGrid";

export async function VendorGrid() {
  const vendors = await getCachedVendors();

  // Only show verified vendors with photos on the landing page
  const verifiedVendors = shuffleVendorsWithSeed(
    vendors.filter((v) => v.verified_at != null && v.cover_image != null),
    getTodaySeed()
  ).slice(0, VENDOR_PREVIEW_COUNT);


  return <VendorPreviewGrid vendors={verifiedVendors} />;
}