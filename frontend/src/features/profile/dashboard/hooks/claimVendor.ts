"use server";

import { supabaseAdminClient } from '@/lib/supabase/clients/adminClient';
import { UserRole } from '@/lib/auth/userRole';
import { revalidateVendor } from '@/lib/actions/revalidate';
import { isClaimProfileEnabled } from '@/lib/env/env';
import { type ClaimLinkOutcome, recordClaimLinkOutcome } from '@/lib/monitoring/claimLinkEvents';
import { normalizeEmail } from '@/lib/profile/normalizeEmail';

/**
 * Verification happens when the claim page loads, but the form posts the token
 * separately — a tab left open past the expiry would otherwise still submit.
 * Mirrors the rule in `verifyVendorMagicLink`: NULL counts as expired, and the
 * check only applies while the claim-profile flag is on.
 */
function isAccessTokenExpired(validUntil: string | null): boolean {
  if (!isClaimProfileEnabled()) return false;
  return !validUntil || new Date(validUntil).getTime() <= Date.now();
}

/** Carries the outcome to record, so the single catch in signUpAndClaimVendor
 *  can log the real reason instead of a generic failure.
 */
class ClaimError extends Error {
  constructor(message: string, readonly outcome: ClaimLinkOutcome) {
    super(message);
  }
}

const CLAIM_RESPONSE_MESSAGE: Partial<Record<ClaimLinkOutcome, string>> = {
  already_claimed: 'This business has already been claimed.',
  invalid_token: 'The token is invalid or the vendor could not be found.',
  expired_claim_link: 'This claim link has expired',
};
const GENERIC_CLAIM_ERROR = 'Something went wrong. Please try again.';

/**
 * Response `type` the caller sees for a failure inside `claimVendor`, so a race
 * looks the same as the equivalent pre-check. Anything unmapped is `claim_failed`.
 */
const CLAIM_RESPONSE_TYPE: Partial<Record<ClaimLinkOutcome, string>> = {
  already_claimed: 'already_claimed',
  invalid_token: 'invalid_token',
  expired_claim_link: 'invalid_token', // the claim page renders "invalid or expired"
};

const record = (outcome: ClaimLinkOutcome, slug: string | null) =>
  recordClaimLinkOutcome(outcome, slug, "claim");

// Not exported: exported functions in a "use server" file are public endpoints,
// and this one trusts the userId it is given. Records nothing itself; throws a
// ClaimError and the catch in signUpAndClaimVendor records exactly once.
async function claimVendor(accessToken: string, userId: string) {

  const user = { id: userId };

  // Verify the vendor exists with this access token. maybeSingle so that "no
  // match" (data null) is distinguishable from a real database error.
  const { data: vendor, error: vendorError } = await supabaseAdminClient
    .from('vendors')
    .select('id, slug, email, access_token_valid_until')
    .eq('access_token', accessToken)
    .maybeSingle();

  if (vendorError) {
    throw new ClaimError('Failed to look up vendor: ' + vendorError.message, 'db_lookup_error');
  }
  if (!vendor) {
    throw new ClaimError('Invalid access token or vendor not found', 'invalid_token');
  }

  if (isAccessTokenExpired(vendor.access_token_valid_until)) {
    throw new ClaimError('This claim link has expired', 'expired_claim_link');
  }

  // Check if vendor is already claimed by someone
  const { data: existingClaim, error: existingClaimError } = await supabaseAdminClient
    .from('profiles')
    .select('id, vendor_id')
    .eq('vendor_id', vendor.id)
    .maybeSingle();

  if (existingClaimError) {
    throw new ClaimError('Failed to check existing claim: ' + existingClaimError.message, 'db_lookup_error');
  }

  if (existingClaim && existingClaim.id !== user.id) {
    throw new ClaimError('This business has already been claimed.', 'already_claimed');
  }

  // Check if this user already has this vendor (idempotent)
  const { data: existingProfile, error: existingProfileError } = await supabaseAdminClient
    .from('profiles')
    .select('vendor_id')
    .eq('id', user.id)
    .maybeSingle();

  if (existingProfileError) {
    throw new ClaimError('Failed to look up profile: ' + existingProfileError.message, 'db_lookup_error');
  }

  if (!existingProfile) {
    // No profile row for a user we just created, e.g. the signup trigger didn't run.
    throw new ClaimError('No profile found for user ' + user.id, 'claim_failed');
  }

  if (existingProfile?.vendor_id === vendor.id) {
    return vendor; // Already claimed by this user
  }

  // If user has a different vendor, prevent claiming
  if (existingProfile?.vendor_id && existingProfile.vendor_id !== vendor.id) {
    throw new ClaimError('User is already associated with a different vendor', 'claim_failed');
  }

  // Update the user's profile to link to this vendor
  const { data: linked, error: profileError } = await supabaseAdminClient
    .from('profiles')
    .update({
      vendor_id: vendor.id,
      role: UserRole.VENDOR
    })
    .eq('id', user.id)
    .select('id');

  if (profileError) {
    throw new ClaimError('Failed to update profile: ' + profileError.message, 'claim_failed');
  }
  if (!linked?.length) {
    throw new ClaimError('Profile not found for user ' + user.id, 'claim_failed');
  }

  return vendor;
}

export async function signUpAndClaimVendor(email: string, accessToken: string, password: string) {
  // Verify the vendor exists with this access token FIRST. maybeSingle so an
  // unknown token (data null) is not confused with an operational DB error.
  const { data: vendor, error: vendorError } = await supabaseAdminClient
    .from('vendors')
    .select('id, slug, email, access_token_valid_until')
    .eq('access_token', accessToken)
    .maybeSingle();

  if (vendorError) {
    console.error(`signUpAndClaimVendor: vendor lookup failed: ${vendorError.message}`);
    await record("db_lookup_error", null); // no slug available, and never log the token
    // Not invalid_token: the link may be fine, and the vendor shouldn't be told otherwise.
    return { success: false, error: 'Something went wrong. Please try again.', type: 'claim_failed' };
  }

  if (!vendor) {
    await record("invalid_token", null); // no slug available, and never log the token
    return { success: false, error: 'Invalid access token or vendor not found', type: 'invalid_token' };
  }

  // Reuses the invalid_token branch so the caller needs no new case; the claim
  // page already renders "invalid or expired" for it.
  if (isAccessTokenExpired(vendor.access_token_valid_until)) {
    await record("expired_claim_link", vendor.slug);
    return {
      success: false,
      error: 'This claim link has expired',
      type: 'invalid_token'
    };
  }

  // The client controls `email`, and the account is created pre-confirmed on
  // the strength of it being the address we already hold, so enforce that.
  // Same response as an invalid token so it reveals nothing about the listing.
  const normalizedEmail = normalizeEmail(email);
  const vendorEmail = normalizeEmail(vendor.email);
  // The claimant must use the email on file for the vendor.
  if (!vendorEmail || normalizedEmail !== vendorEmail) {
    await record("email_mismatch", vendor.slug);
    return { success: false, error: 'Invalid access token or vendor not found', type: 'invalid_token' };
  }

  // Check if vendor is already claimed
  const { data: existingClaim, error: existingClaimError } = await supabaseAdminClient
    .from('profiles')
    .select('id, vendor_id')
    .eq('vendor_id', vendor.id)
    .maybeSingle();

  if (existingClaimError) {
    console.error(`signUpAndClaimVendor: claim check failed for "${vendor.slug}": ${existingClaimError.message}`);
    await record("db_lookup_error", vendor.slug);
    return { success: false, error: GENERIC_CLAIM_ERROR, type: 'claim_failed' };
  }

  if (existingClaim) {
    await record("already_claimed", vendor.slug);
    return {
      success: false,
      error: 'Vendor already claimed',
      type: 'already_claimed'
    };
  }



  // create user silently with NO confirmation email
  const { data: newUser, error: createError } = await supabaseAdminClient.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,        // confirming email is legitimate and verified since we are using existing vendor email
  });
  if (createError) {

    // Supabase words this differently across versions ("User already registered"
    // vs "...has already been registered"), so check the code as well.
    if (
      createError.code === "email_exists" ||
      createError.message?.toLowerCase().includes("already registered")
    ) {
      await record("email_exists", vendor.slug);

      return {
        success: false,
        type: "email_exists",
        error: "Email already registered"
      };
    }
    console.error(`signUpAndClaimVendor: createUser failed for "${vendor.slug}":`, createError.message);
    await record("create_failed", vendor.slug);
    return {
      success: false,
      type: "create_failed",
      error: GENERIC_CLAIM_ERROR
    };
  }

  const newUserId = newUser?.user?.id;

  if (!newUserId) {
    await record("create_failed", vendor.slug);
    return {
      success: false,
      type: "create_failed",
      error: "No user returned from creation"
    };
  }

  // Confirm email and claim vendor using existing function
  // Pass the userId since there's no session yet
  try {
    await claimVendor(accessToken, newUserId);
  } catch (error) {
    const reason: ClaimLinkOutcome = error instanceof ClaimError ? error.outcome : "claim_failed";
    // The real cause goes to the logs only. Without this, nothing keeps it
    // once it's no longer in the response.
    console.error(`signUpAndClaimVendor: claimVendor failed for "${vendor.slug}" (${reason}):`, error);

    const { error: deleteError } = await supabaseAdminClient.auth.admin.deleteUser(newUserId);
    if (deleteError) {
      console.error(`Failed to rollback user creation (${newUserId}): ${deleteError.message}`);
    }
    await record(deleteError ? "rollback_failed" : reason, vendor.slug);

    return {
      success: false,
      error: CLAIM_RESPONSE_MESSAGE[reason] ?? GENERIC_CLAIM_ERROR,
      type: CLAIM_RESPONSE_TYPE[reason] ?? 'claim_failed',
    };
  }

  const now = new Date().toISOString();

  // Clear the access token so it can't be reused, update verified_at
  const { error: vendorUpdateError } = await supabaseAdminClient
    .from('vendors')
    .update({
      access_token: null,
      access_token_valid_until: null,
      verified_at: now
    })
    .eq('id', vendor.id);

  if (vendorUpdateError) {
    console.error(`signUpAndClaimVendor: vendor finalize failed for "${vendor.slug}":`, vendorUpdateError.message);

    await record("vendor_update_failed", vendor.slug);
    return {
      success: false,
      type: 'vendor_update_failed',
      error: "Your account was created, but we couldn't finish setting up your profile. Please try logging in, or contact us.",
    };
  }

  let revalidateFailed = false;
  try {
    await revalidateVendor(vendor.slug);
  } catch (e) {
    revalidateFailed = true;
    console.error(`signUpAndClaimVendor: revalidateVendor failed for "${vendor.slug}":`, e);
  }
  await record(revalidateFailed ? "revalidate_failed" : "claimed", vendor.slug);

  return {
    success: true,
    type: 'created',
    userId: newUserId,
    email: normalizedEmail,
  };
}