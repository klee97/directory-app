import type { Metadata } from "next";
import Box from "@mui/system/Box";
import VendorClaimContent from "@/features/vendorClaim/components/VendorClaimContent";
import { EMAIL_PARAM, SLUG_PARAM, TOKEN_PARAM } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Claim your profile | Asian Wedding Makeup",
  robots: {
    index: false,
    follow: false,
  },
};

/** A repeated param (`?slug=a&slug=b`) is not a link we minted — treat it as absent. */
function readParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

/**
 * Reading the magic-link params here rather than via `useSearchParams` makes
 * this route dynamic, which is the point: statically prerendered pages hydrate
 * with an empty search-param set on the first client render, so the claim
 * component used to decide the link was incomplete before the real params
 * arrived. Nothing is lost by rendering per-request — the page is noindex,
 * per-visitor, and has to hit the database anyway.
 */
export default async function VendorClaimPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <Box sx={{ bgcolor: "background.back", minHeight: "100vh", display: "flex" }}>
      <VendorClaimContent
        slug={readParam(params[SLUG_PARAM])}
        email={readParam(params[EMAIL_PARAM])}
        token={readParam(params[TOKEN_PARAM])}
      />
    </Box>
  );
}
