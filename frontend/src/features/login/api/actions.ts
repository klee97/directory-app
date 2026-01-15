'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/admin-client';
import { getBaseUrl } from '@/lib/env/env';

const getAccountType = async (email: string): Promise<'vendor' | 'customer' | null> => {
  const { data: userId, error } = await supabaseAdmin
    .rpc("get_user_id_by_email",
      {
        p_email: email
      }
    );

  if (error || !userId) {
    console.debug('Error looking up user by email for account type:', error);
    return null;
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select(`
      vendor_id,
      role
    `)
    .eq('id', userId)
    .single();

  if (profileError) {
    console.debug(`Error fetching profile for user id ${userId}:`, profileError);
    return null;
  }

  if (profile?.vendor_id && profile?.role === 'vendor') {
    return 'vendor';
  }
  return 'customer';
}

export async function login(formData: FormData, isVendorLogin: boolean) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const isVendorAccount = await getAccountType(email) === 'vendor';

  if (isVendorAccount !== isVendorLogin) {
    log.debug('Account type does not match login site type for email:', email);
    return { error: 'Invalid email or password.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    switch (error.code) {
      case 'invalid_credentials':
        return { error: 'Invalid email or password' };
      case 'email_not_confirmed':
        return {
          error: 'This email is already registered but not verified.',
          action: 'verify-email'
        };
      case 'user_banned':
        return { error: 'This account has been banned. Please contact support.' };
      default:
        return { error: error.message };
    }
  }

  revalidatePath('/', 'layout');
  return { success: true, session: data.session };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!email || !password || !confirmPassword) {
    return { error: 'All fields are required' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long' };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });

  if (error) {
    switch (error.code) {
      case 'email_exists':
        return {
          error: 'An account with this email already exists.',
          action: 'login'
        };
      case 'weak_password':
        return { error: 'Password does not meet strength criteria.' };
      case 'signup_disabled':
        return { error: 'Signups are currently disabled.' };
      default:
        return { error: error.message };
    }
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function requestPasswordReset(email: string, isVendorSite: boolean) {
  if (!email) {
    console.debug('No email provided for password reset');
    return { success: true }; // Always return success for security
  }

  try {
    const isVendorAccount = await getAccountType(email) === 'vendor';

    // Only send reset email if account type matches the site type
    if (isVendorAccount === isVendorSite) {
      console.debug(`Sending password reset email for ${isVendorAccount ? 'vendor' : 'customer'}:`, email);
      const redirectToUrl = isVendorAccount
        ? `${getBaseUrl()}/partner/auth/reset-password`
        : `${getBaseUrl()}/auth/reset-password`;

      const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: redirectToUrl,
      });

      if (resetError) {
        console.debug('Error sending password reset email:', resetError);
      }
    }

    return { success: true };
  } catch (error) {
    console.debug('Unexpected error in requestPasswordReset:', error);
    return { success: true };
  }
}