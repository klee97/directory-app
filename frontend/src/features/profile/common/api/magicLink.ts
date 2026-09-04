"use server";
import { supabaseAdminClient } from "@/lib/supabase/clients/adminClient";
import { isClaimProfileEnabled } from "@/lib/env/env";

export type VerifyVendorMagicLinkResult = {
  success: boolean;
  /** Whether the listing has an email on file we could send a fresh link to. */
  hasEmailOnFile: boolean;
  /** Whether the listing is already claimed — a new link won't help. */
  isClaimed: boolean;
  vendorEmail: string | null;
  vendorBusinessName: string | null;
};

/** Nothing matched — say as little as possible about why. */
const FAILURE: VerifyVendorMagicLinkResult = {
  success: false,
  hasEmailOnFile: false,
  isClaimed: false,
  vendorEmail: null,
  vendorBusinessName: null,
};

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
  token: string
): Promise<VerifyVendorMagicLinkResult> {
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
    email.toLowerCase() === vendor.email?.toLowerCase() &&
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
