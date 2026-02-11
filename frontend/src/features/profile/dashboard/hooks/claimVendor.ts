"use server";

import { supabaseAdmin } from '@/lib/admin-client';

export async function claimVendor(accessToken: string, userId: string) {

  const user = { id: userId };

  // Verify the vendor exists with this access token
  const { data: vendor, error: vendorError } = await supabaseAdmin
    .from('vendors')
    .select('id, email')
    .eq('access_token', accessToken)
    .single();

  if (vendorError || !vendor) {
    throw new Error('Invalid access token or vendor not found');
  }

  // Check if vendor is already claimed by someone
  const { data: existingClaim } = await supabaseAdmin
    .from('profiles')
    .select('id, vendor_id')
    .eq('vendor_id', vendor.id)
    .maybeSingle();

  if (existingClaim && existingClaim.id !== user.id) {
    throw new Error('This vendor is already claimed by another account');
  }

  // Check if this user already has this vendor (idempotent)
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('vendor_id')
    .eq('id', user.id)
    .single();

  if (existingProfile?.vendor_id === vendor.id) {
    return vendor; // Already claimed by this user
  }

  // If user has a different vendor, prevent claiming
  if (existingProfile?.vendor_id && existingProfile.vendor_id !== vendor.id) {
    throw new Error('User is already associated with a different vendor');
  }

  // Update the user's profile to link to this vendor
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      vendor_id: vendor.id,
      role: 'vendor'
    })
    .eq('id', user.id);

  if (profileError) {
    throw new Error('Failed to update profile: ' + profileError.message);
  }

  return vendor;
}

export async function signUpAndClaimVendor(email: string, accessToken: string, password: string) {
  // Verify the vendor exists with this access token FIRST
  const { data: vendor, error: vendorError } = await supabaseAdmin
    .from('vendors')
    .select('id, email')
    .eq('access_token', accessToken)
    .single();

  if (vendorError || !vendor) {
    return {
      success: false,
      error: 'Invalid access token or vendor not found',
      type: 'invalid_token'
    };
  }

  // Check if vendor is already claimed
  const { data: existingClaim } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id, vendor_id')
    .eq('vendor_id', vendor.id)
    .maybeSingle();

  if (existingClaim) {
    return {
      success: false,
      error: 'Vendor already claimed',
      type: 'already_claimed'
    };
  }

  // create user silently with NO confirmation email
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,        // confirming email is legitimate and verified since we are using existing vendor email
  });
  if (createError) {
    if (createError.message?.toLowerCase().includes("already registered")) {
      return {
        success: false,
        type: "email_exists",
        error: "Email already registered"
      };
    }

    return {
      success: false,
      type: "create_failed",
      error: "Failed to create user: " + createError.message
    };
  }

  const newUserId = newUser?.user?.id;

  if (!newUserId) {
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
    // Rollback: delete the user we just created
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(newUserId);
    if (deleteError) {
      console.error(`Failed to rollback user creation (${newUserId}): ${deleteError.message}`);
      // todo: create an alert or slack message for this
    }

    return {
      success: false,
      error: 'Failed to claim vendor: ' + (error as Error).message,
      type: 'claim_failed'
    };
  }

  // Clear the access token so it can't be reused and update verified_at timestamp
  await supabaseAdmin
    .from('vendors')
    .update({ access_token: null, verified_at: new Date().toISOString() })
    .eq('id', vendor.id);

  return {
    success: true,
    type: 'created',
    userId: newUserId
  };
}
