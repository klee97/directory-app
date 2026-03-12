'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

export enum AccountType {
  VENDOR = 'vendor',
  CUSTOMER = 'customer'
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('vendor_id, role')
    .eq('id', data.user.id)
    .single();

  const isVendorAccount = !!(profile?.vendor_id && profile?.role === 'vendor');

  revalidatePath('/', 'layout');
  return { success: true, session: data.session, isVendorAccount };
}
