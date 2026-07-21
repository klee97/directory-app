"use server";

import { supabaseAdminClient } from "@/lib/supabase/clients/adminClient";
import { verifyRecaptchaToken } from "@/lib/security/recaptchaVerification";
import { getBaseUrl } from "@/lib/env/env";
import { EMAIL_PARAM, SLUG_PARAM, TOKEN_PARAM } from "@/lib/constants";
import { randomUUID } from "crypto";

export type RequestClaimLinkResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Public, unauthenticated action that lets a vendor request a claim link be
 * emailed to the address we already have on file for their listing.
 *
 * Security notes:
 * - We never accept or reveal the email from the client; it is read server-side
 *   from the vendor record so a bride poking at this can't learn or set it.
 * - The response is intentionally generic (no enumeration): callers can't tell
 *   whether a vendor exists, is already claimed, or has an email on file.
 * - reCAPTCHA gates the request to make inbox-spamming a vendor harder.
 * - The actual email is sent by the `send-claim-link` Supabase edge function
 *   (backend contract below), keeping delivery consistent with how inquiries
 *   are handled outside this repo.
 *
 * Edge function contract — `send-claim-link` receives:
 *   { vendorId: string; email: string; businessName: string; claimUrl: string }
 * and is responsible for emailing `claimUrl` to `email`.
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
    .select("id, email, business_name, access_token, verified_at")
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

  // Reuse the existing access token if the listing already has one (e.g. a
  // magic link was minted earlier); otherwise generate and persist a new one.
  let accessToken = vendor.access_token;
  if (!accessToken) {
    accessToken = randomUUID();
    const { error: tokenError } = await supabaseAdminClient
      .from("vendors")
      .update({ access_token: accessToken })
      .eq("id", vendor.id);

    if (tokenError) {
      console.error(`requestClaimLink: failed to set access token for "${slug}":`, tokenError.message);
      return genericSuccess;
    }
  }

  const claimUrl = `${getBaseUrl()}/partner/claim?${SLUG_PARAM}=${encodeURIComponent(slug)}&${EMAIL_PARAM}=${encodeURIComponent(vendor.email)}&${TOKEN_PARAM}=${encodeURIComponent(accessToken)}`;

  const { error: invokeError } = await supabaseAdminClient.functions.invoke("send-claim-link", {
    body: {
      vendorId: vendor.id,
      email: vendor.email,
      businessName: vendor.business_name,
      claimUrl,
    },
  });

  if (invokeError) {
    console.error(`requestClaimLink: send-claim-link failed for "${slug}":`, invokeError.message);
    // Still return generic success — delivery is fire-and-forget and we don't
    // want to reveal state or invite retries that probe for valid vendors.
    return genericSuccess;
  }

  return genericSuccess;
}
