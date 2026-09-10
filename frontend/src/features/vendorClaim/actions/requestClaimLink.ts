"use server";

import { supabaseAdminClient } from "@/lib/supabase/clients/adminClient";
import { verifyRecaptchaToken } from "@/lib/security/recaptchaVerification";
import {
  getAccessTokenValidDurationSeconds,
  getBaseUrl,
  getClaimLinkCooldownSeconds,
} from "@/lib/env/env";
import { EMAIL_PARAM, SLUG_PARAM, TOKEN_PARAM } from "@/lib/constants";
import { revalidateVendor } from "@/lib/actions/revalidate";
import { sendClaimLinkEmail } from "@/lib/resend/resend";

export type RequestClaimLinkResult =
  | { success: true }
  | { success: false; error: string };

/** "30 seconds" / "1 minute" / "4 minutes" — no dependency for one sentence. */
function formatWait(seconds: number): string {
  if (seconds < 60) {
    const s = Math.max(1, seconds);
    return `${s} second${s === 1 ? "" : "s"}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

/**
 * Message for a request refused by the cooldown. `validUntil` is the value read
 * before the update; when it is missing or not derivable we lost a race rather
 * than hitting the cooldown, so fall back to the full cooldown length.
 */
function cooldownError(
  validUntil: string | null,
  nowMs: number,
  validMs: number,
  cooldownMs: number
): string {
  const requestedAtMs = validUntil ? new Date(validUntil).getTime() - validMs : NaN;
  const remainingMs = Number.isFinite(requestedAtMs)
    ? requestedAtMs + cooldownMs - nowMs
    : cooldownMs;
  const wait = formatWait(Math.ceil(Math.min(Math.max(remainingMs, 0), cooldownMs) / 1000));

  return `Check your inbox and spam folder for the link. Still don't see it? Request a new link in ${wait}.`;
}

/**
 * Public, unauthenticated action that lets a vendor request a claim link be
 * emailed to the address we already have on file for their listing.
 *
 * Security notes:
 * - We never accept or reveal the email from the client; it is read server-side
 *   from the vendor record so a bride poking at this can't learn or set it.
 * - reCAPTCHA gates the request to make inbox-spamming a vendor harder.
 * - A per-listing cooldown (CLAIM_LINK_REQUEST_COOLDOWN_SECONDS) refuses repeat
 *   requests, so neither a script nor an impatient human can flood the
 *   vendor's inbox — or keep rotating the token out from under a link the
 *   vendor is already trying to use.
 * - The email itself is sent via a Resend template (see `sendClaimLinkEmail`),
 *   populated with the vendor's business name and the generated claim URL.
 */
export async function requestClaimLink({
  slug,
  recaptchaToken,
}: {
  slug: string;
  recaptchaToken: string;
}): Promise<RequestClaimLinkResult> {
  if (!slug) {
    return { success: false, error: "Missing vendor." };
  }

  const { success: isHuman } = await verifyRecaptchaToken(recaptchaToken);
  if (!isHuman) {
    return { success: false, error: "Could not verify the request. Please try again." };
  }

  // Generic success is returned for every "can't send" branch below to avoid
  // leaking whether a vendor exists / is claimed / has an email on file.
  const genericSuccess: RequestClaimLinkResult = { success: true };

  const { data: vendor, error } = await supabaseAdminClient
    .from("vendors")
    .select("id, email, business_name, access_token, access_token_valid_until, verified_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`requestClaimLink: failed to look up vendor "${slug}":`, error.message);
    return genericSuccess;
  }

  // No such vendor, already claimed, or no email to send to → say nothing.
  if (!vendor || vendor.verified_at || !vendor.email) {
    return genericSuccess;
  }

  // Re-generate the access token to invalidate earlier magic links, and stamp
  // the expiry the claim + verification paths check against.
  const nowMs = Date.now();
  const validMs = getAccessTokenValidDurationSeconds() * 1000;
  const cooldownMs = getClaimLinkCooldownSeconds() * 1000;
  const accessToken = crypto.randomUUID();
  const accessTokenValidUntil = new Date(nowMs + validMs).toISOString();

  // The cooldown is enforced by folding its condition into the UPDATE itself,
  // so check-and-set is a single statement two concurrent requests can't slip
  // between. We have no dedicated "last requested at" column: the request time
  // is recovered as `access_token_valid_until - validMs`, which makes
  //
  //   in cooldown  <=>  access_token_valid_until > now + validMs - cooldownMs
  //
  // A `valid_until` beyond `now + validMs` can't have been minted under the
  // current ACCESS_TOKEN_VALID_DURATION_SECONDS, so the derivation is meaningless and
  // we fail open rather than locking the listing out until the token expires.
  let updateQuery = supabaseAdminClient
    .from("vendors")
    .update({ access_token: accessToken, access_token_valid_until: accessTokenValidUntil })
    .eq("id", vendor.id);

  if (cooldownMs > 0) {
    const cutoff = new Date(nowMs + validMs - cooldownMs).toISOString();
    const underivable = new Date(nowMs + validMs).toISOString();
    updateQuery = updateQuery.or(
      `access_token_valid_until.is.null,` +
      `access_token_valid_until.lte.${cutoff},` +
      `access_token_valid_until.gt.${underivable}`
    );
  }

  const { data: updated, error: tokenError } = await updateQuery.select("id");

  if (tokenError) {
    console.error(`requestClaimLink: failed to set access token for "${slug}":`, tokenError.message);
    return genericSuccess;
  }

  // No row matched: the listing is inside its cooldown, or a concurrent request
  // just claimed the window. Unlike the branches above this reports a real
  // error, which is safe — it is only reachable for a listing that exists, is
  // unclaimed and has an email on file, and the public profile page already
  // discloses all three by opening this dialog with a masked email hint.
  if (!updated?.length) {
    return { success: false, error: cooldownError(vendor.access_token_valid_until, nowMs, validMs, cooldownMs) };
  }

  // The vendor detail page reads this vendor via getCachedVendor (for the
  // claim CTA's isClaimed/emailHint), so bust it now or the freshly minted
  // token won't be reflected there for up to 24h.
  await revalidateVendor(slug);

  const claimUrl = `${getBaseUrl()}/partner/claim?${SLUG_PARAM}=${encodeURIComponent(slug)}&${EMAIL_PARAM}=${encodeURIComponent(vendor.email)}&${TOKEN_PARAM}=${encodeURIComponent(accessToken)}`;

  const emailSent = await sendClaimLinkEmail({
    email: vendor.email,
    businessName: vendor.business_name,
    claimUrl,
  });

  if (!emailSent) {
    console.error(`requestClaimLink: failed to send claim link email for "${slug}"`);
  }

  return genericSuccess;
}
