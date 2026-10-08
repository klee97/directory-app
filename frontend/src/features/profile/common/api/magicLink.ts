"use server";
import { supabaseAdminClient } from "@/lib/supabase/clients/adminClient";
import { isClaimProfileEnabled } from "@/lib/env/env";
import { verifyRecaptchaToken } from "@/lib/security/recaptchaVerification";

export type VerifyVendorMagicLinkResult = {
  success: boolean;
  /** Whether the listing has an email on file we could send a fresh link to. */
  hasEmailOnFile: boolean;
  /** Whether the listing is already claimed — a new link won't help. */
  isClaimed: boolean;
  /** The request failed the bot check, not the link check. */
  recaptchaFailed: boolean;
  vendorEmail: string | null;
  vendorBusinessName: string | null;
};

/** Nothing matched — say as little as possible about why. */
const FAILURE: VerifyVendorMagicLinkResult = {
  success: false,
  hasEmailOnFile: false,
  isClaimed: false,
  recaptchaFailed: false,
  vendorEmail: null,
  vendorBusinessName: null,
};

/**
 * Addresses can't contain spaces, so a space here is always a `+` that lost its
 * encoding: `?email=a+b@x.com` parses to "a b@x.com" under the
 * application/x-www-form-urlencoded rules `URLSearchParams` follows. We mint
 * links with `encodeURIComponent`, but anything that re-serializes the query in
 * between — a mail client, a tracking redirect, a hand-edited URL — can drop
 * the `%2B`, which would otherwise reject every plus-addressed vendor.
 */
function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase().replaceAll(" ", "+");
}

/**
 * Validates a claim magic link (slug + email + token) against the vendor row.
 *
 * Reads through the admin client rather than the cached public vendor fetch so
 * that (a) the token never has to travel onto the public `Vendor` object, and
 * (b) a freshly minted token isn't rejected because of a stale cache entry.
 *
 * `access_token_valid_until` is only enforced when the claim-profile flag is on.
 * A NULL expiry counts as expired: every link we mint stamps one, so a token
 * without an expiry is a legacy `gen_random_uuid()` column default, not a link
 * anyone was actually sent.
 */
export async function verifyVendorMagicLink(
  slug: string,
  email: string,
  token: string,
  recaptchaToken: string
): Promise<VerifyVendorMagicLinkResult> {
  // Gate before any database work, as requestClaimLink does — otherwise this
  // endpoint is a free oracle for brute-forcing tokens.
  const { success: isHuman } = await verifyRecaptchaToken(recaptchaToken);
  if (!isHuman) {
    return { ...FAILURE, recaptchaFailed: true };
  }

  const { data: vendor, error } = await supabaseAdminClient
    .from("vendors")
    .select("email, business_name, access_token, access_token_valid_until, verified_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`verifyVendorMagicLink: failed to look up vendor "${slug}":`, error.message);
    return FAILURE;
  }

  if (!vendor) {
    return FAILURE;
  }

  // What the error page needs to offer a useful next step. Safe to surface:
  // both are already visible on the public listing.
  const context = {
    hasEmailOnFile: !!vendor.email,
    isClaimed: !!vendor.verified_at,
  };

  const doEmailAndTokenMatch =
    !!vendor.access_token &&
    !!vendor.email &&
    normalizeEmail(email) === normalizeEmail(vendor.email) &&
    token.toLowerCase() === vendor.access_token.toLowerCase();

  const isExpired =
    isClaimProfileEnabled() &&
    (!vendor.access_token_valid_until ||
      new Date(vendor.access_token_valid_until).getTime() <= Date.now());

  const success = doEmailAndTokenMatch && !isExpired;

  console.debug(
    `Magic link verification for vendor "${slug}": ${success ? "SUCCESS" : "FAILURE"}` +
    `${doEmailAndTokenMatch && isExpired ? " (expired)" : ""}`
  );

  return {
    ...FAILURE,
    ...context,
    success,
    // Only echo vendor details back once the link has actually been proven.
    vendorEmail: success ? vendor.email : null,
    vendorBusinessName: success ? vendor.business_name : null,
  };
}
