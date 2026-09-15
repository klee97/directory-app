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
 * Whether a listing is still inside its cooldown.
 *
 * There is no dedicated "last requested at" column: the request time is
 * recovered from `access_token_valid_until`, which is stamped as
 * `requestedAt + validMs`. An expiry beyond `now + validMs` cannot have been
 * set under the current ACCESS_TOKEN_VALID_DURATION_SECONDS, so we fail the cooldown
 * rather than wait
 */
function isWithinCooldown(
  validUntil: string | null,
  nowMs: number,
  validMs: number,
  cooldownMs: number
): boolean {
  if (!validUntil) {
    // never requested
    return false;
  }
  const validUntilMs = new Date(validUntil).getTime();
  if (!Number.isFinite(validUntilMs)) {
    return false;
  }
  if (validUntilMs > nowMs + validMs) {
    // not valid with current configured cooldown so false
    return false;
  }
  return nowMs < validUntilMs - validMs + cooldownMs;
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

  const previousValidUntil = vendor.access_token_valid_until;

  // Refusing here reports a real error rather than the generic success used by
  // the branches above. That is safe: this is only reachable for a listing that
  // exists, is unclaimed and has an email on file, all of which the public
  // profile page already discloses by opening this dialog with a masked hint.
  if (cooldownMs > 0 && isWithinCooldown(previousValidUntil, nowMs, validMs, cooldownMs)) {
    return {
      success: false,
      error: cooldownError(previousValidUntil, nowMs, validMs, cooldownMs),
    };
  }

  // Compare-and-swap on the value we just read, so the decision above and this
  // write can't be split by a concurrent request: if anything else rotated the
  // token in between, `access_token_valid_until` no longer matches and we
  // update nothing.
  //
  // This deliberately uses only simple filters. Expressing the whole predicate
  // as a single `.or(...)` on the UPDATE is rejected by the PostgREST version
  // Supabase currently runs — logical operators on a mutation fail with
  // "column vendors.<name> does not exist", regardless of the column.
  const updateValues = {
    access_token: accessToken,
    access_token_valid_until: accessTokenValidUntil,
  };
  const updateQuery = supabaseAdminClient
    .from("vendors")
    .update(updateValues)
    .eq("id", vendor.id);

  const { data: updated, error: tokenError } = await (
    previousValidUntil === null
      ? updateQuery.is("access_token_valid_until", null)
      : updateQuery.eq("access_token_valid_until", previousValidUntil)
  ).select("id");

  if (tokenError) {
    console.error(`requestClaimLink: failed to set access token for "${slug}":`, tokenError.message);
    return genericSuccess;
  }

  // Lost the race — another request rotated the token first, so a link is
  // already on its way. With the cooldown disabled that is simply a success.
  if (!updated?.length) {
    return cooldownMs > 0
      ? { success: false, error: cooldownError(previousValidUntil, nowMs, validMs, cooldownMs) }
      : genericSuccess;
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
