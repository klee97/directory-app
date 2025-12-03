"use server";

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/admin-client';

export async function claimVendor(accessToken: string, autoConfirm: boolean = false, userId?: string) {
  const supabase = await createClient();
  
  // If userId is provided (for new signups), use that; otherwise get from session
  let user;
  if (userId) {
    user = { id: userId };
  } else {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      throw new Error('User not authenticated');
    }
    user = authUser;
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

export async function signUpAndClaimVendor(email: string, accessToken: string) {
  const supabase = await createClient();
  
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

  // Check if user with this email already exists
  const { data: existingUserData } = await supabaseAdmin.auth.admin.listUsers();
  const userExists = existingUserData.users.some(u => u.email === email);

  if (userExists) {
    return {
      success: false,
      error: 'Email already registered',
      type: 'email_exists'
    };
  }

  // Create user using signUp (won't create session due to email confirmation requirement)
  const password = generateSecurePassword();
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        has_password: false,
        email_context: 'initial_verification'
      }
    }
  });

  if (signUpError || !signUpData.user) {
    return {
      success: false,
      error: 'Failed to create user: ' + signUpError?.message,
      type: 'create_failed'
    };
  }

  // Confirm email and claim vendor using existing function
  // Pass the userId since there's no session yet
  try {
    await claimVendor(accessToken, true, signUpData.user.id);
  } catch (error) {
    // Rollback: delete the user we just created
    await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id);
    
    return {
      success: false,
      error: 'Failed to claim vendor: ' + (error as Error).message,
      type: 'claim_failed'
    };
  }

  // Now create a session for the user using admin.generateLink
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
  });

  if (linkError || !linkData) {
    return {
      success: false,
      error: 'Account created but failed to generate sign-in link',
      type: 'session_failed'
    };
  }

  return {
    success: true,
    type: 'created',
    userId: signUpData.user.id,
    hashedToken: linkData.properties.hashed_token
  };
}

function generateSecurePassword(length: number = 32): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|:;<>?,./';
  
  const allChars = lowercase + uppercase + numbers + special;
  let password = '';
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}