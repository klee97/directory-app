'use server';

import { revalidatePath } from 'next/cache';

import { createServerClient } from '@/lib/supabase/clients/serverClient';
import { UserRole, getUserRole } from '@/lib/auth/userRole';

export async function login(formData: FormData) {
  const supabaseServerClient = await createServerClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const { data, error } = await supabaseServerClient.auth.signInWithPassword({
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

  const { data: profile } = await supabaseServerClient
    .from('profiles')
    .select('vendor_id, role')
    .eq('id', data.user.id)
    .single();

  const isVendorAccount = getUserRole(profile) === UserRole.VENDOR;

  revalidatePath('/', 'layout');
  return {
    success: true, isVendorAccount,
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}
