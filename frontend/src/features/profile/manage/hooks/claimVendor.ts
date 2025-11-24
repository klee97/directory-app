"use server";

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/admin-client';

export async function claimVendor(accessToken: string) {
  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the vendor exists with this access token
  const { data: vendor, error: vendorError } = await supabaseAdmin
    .from('vendors')
    .select('id')
    .eq('access_token', accessToken)
    .single();

  if (vendorError || !vendor) {
    throw new Error('Invalid access token or vendor not found');
  }

  // Check if this user already has a vendor associated
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('vendor_id')
    .eq('id', user.id)
    .single();

  // If user already claimed this vendor, just return success (idempotent)
  if (existingProfile?.vendor_id === vendor.id) {
    return vendor;
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

  // Can remove the vendor_access from vendor if it's a one-time token
  return vendor;
}