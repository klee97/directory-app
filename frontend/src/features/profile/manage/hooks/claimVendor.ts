"use server";

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/admin-client';

export async function claimVendor(accessToken: string, autoConfirm: boolean = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

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

  // Auto-confirm email if requested (for new signups via magic link)
  if (autoConfirm) {
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });
  }

  // Clear any pending metadata
  await supabase.auth.updateUser({
    data: {
      pending_vendor_access_token: null
    }
  });

  return vendor;
}