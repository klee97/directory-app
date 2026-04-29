import { createBrowserClient } from '@/lib/supabase/clients/browserClient';
import { getBaseUrl } from '@/lib/env/env';

const supabase = createBrowserClient();

export const updatePassword = async (currentEmail: string, currentPassword: string, newPassword: string) => {

  // First verify the current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: currentEmail,
    password: currentPassword,
  });

  if (signInError) {
    return { error: 'Invalid password. Please check your password and try again.' };
  }

  // If current password is correct, update to new password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    data: {
      has_password: 'true'
    }
  });
  if (error) {
    return { error: error.message };
  }
};

export const updatePasswordAfterReset = async (newPassword: string, isVendorSite: boolean) => {
  const redirectToUrl = isVendorSite
    ? `${getBaseUrl()}/partner/login`
    : `${getBaseUrl()}/login`;
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    data: {
      has_password: 'true'
    }
  }, {
    emailRedirectTo: redirectToUrl,
  });
  if (error) {
    return { error: error.message };
  }
};

