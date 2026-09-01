"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { useRouter } from "next/navigation";
import AlertTitle from "@mui/material/AlertTitle";
import { CLAIM_PARAM } from "@/lib/constants";

export type ErrorType =
  | "invalid_link"
  | "missing_params"
  | "recaptcha_failed"
  | null;

const ERROR_CONTENT: Record<
  NonNullable<ErrorType>,
  { title: string; message: string; primaryLabel: string; primaryHref: string }
> = {
  invalid_link: {
    title: "Invalid claim link",
    message: "This link is invalid or has already been used. Each link can only be used once.",
    primaryLabel: "Log in",
    primaryHref: "/partner/login",
  },
  missing_params: {
    title: "Incomplete claim link",
    message:
      "The link appears to be incomplete. Please check you've copied the full URL from your email.",
    primaryLabel: "Log in",
    primaryHref: "/partner/login",
  },
  recaptcha_failed: {
    title: "Security verification failed",
    message:
      "We couldn't verify your request. This may be due to a network issue or browser settings.",
    primaryLabel: "Try again",
    primaryHref: "", // handled separately via reload
  },
};

/**
 * Copy for an invalid link once claim links can expire. We can't tell the two
 * apart without leaking whether a token ever existed, so the message covers
 * both. Deliberately vague about the lifetime — it's env-configurable.
 */
const EXPIRABLE_INVALID_LINK = {
  title: "Invalid or expired claim link",
  message:
    "This link is invalid, has expired, or has already been used. Claim links can only be used " +
    "once and expire after a while — request a new one to continue.",
};

interface VendorClaimErrorProps {
  errorType: NonNullable<ErrorType>;
  /** Vendor slug from the link, used to route back to the listing's claim CTA. */
  slug?: string;
  /** Whether the listing has an email on file a fresh link could go to. */
  hasEmailOnFile?: boolean;
  /** Already-claimed listings have an account — a new link won't help. */
  isClaimed?: boolean;
}

export default function VendorClaimError({
  errorType,
  slug,
  hasEmailOnFile,
  isClaimed,
}: VendorClaimErrorProps) {
  const router = useRouter();
  const isClaimProfileEnabled =
    process.env.NEXT_PUBLIC_FEATURE_CLAIM_PROFILE_ENABLED === "true";

  const base = ERROR_CONTENT[errorType];
  const isExpirableInvalidLink = isClaimProfileEnabled && errorType === "invalid_link";

  const { title, message } = isExpirableInvalidLink ? EXPIRABLE_INVALID_LINK : base;

  // Send the vendor back to the listing's "Manage this profile" CTA so they can
  // mint a fresh link. Claimed listings already have an account, and a listing
  // with no email on file has nowhere to send one — both keep the login button.
  const canRequestNewLink = isExpirableInvalidLink && !!slug && !isClaimed;
  const primaryLabel = canRequestNewLink ? "Request a new link" : base.primaryLabel;
  const primaryHref = canRequestNewLink
    ? hasEmailOnFile
      ? `/vendors/${slug}?${CLAIM_PARAM}=1`
      : `/vendors/${slug}`
    : base.primaryHref;

  const handlePrimary = () => {
    if (errorType === "recaptcha_failed") {
      window.location.reload();
    } else {
      router.push(primaryHref);
    }
  };

  return (
    <>
      <Alert severity="error" sx={{ mb: 3 }}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button variant="contained" onClick={handlePrimary} fullWidth>
          {primaryLabel}
        </Button>
        <Button variant="outlined" onClick={() => router.push("/partner")} fullWidth>
          Return home
        </Button>
      </Box>
    </>
  );
}
