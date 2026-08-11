"use server";

import { supabaseAdminClient } from "@/lib/supabase/clients/adminClient";
import { verifyRecaptchaToken } from "@/lib/security/recaptchaVerification";
import { getBaseUrl } from "@/lib/env/env";
import { EMAIL_PARAM, SLUG_PARAM, TOKEN_PARAM } from "@/lib/constants";
import { revalidateVendor } from "@/lib/actions/revalidate";
import { sendClaimLinkEmail } from "@/lib/resend/resend";

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
 * - reCAPTCHA gates the request to make inbox-spamming a vendor harder.
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

  // Re-generate the access token to invalidate earlier magic links.
  const accessToken = crypto.randomUUID();
  const { error: tokenError } = await supabaseAdminClient
    .from("vendors")
    .update({ access_token: accessToken })
    .eq("id", vendor.id);

  if (tokenError) {
    console.error(`requestClaimLink: failed to set access token for "${slug}":`, tokenError.message);
    return genericSuccess;
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
