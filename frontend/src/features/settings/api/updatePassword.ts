import { createClient } from '@/lib/supabase/client';
import { getBaseUrl } from '@/lib/env/env';

const supabase = createClient();

export const updatePassword = async (currentPassword: string, newPassword: string) => {
  // First verify the current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: (await supabase.auth.getUser()).data.user?.email || '',
    password: currentPassword,
  });

  if (signInError) throw signInError;

  // If current password is correct, update to new password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    data: {
      has_password: 'true'
    }
  });
  if (error) throw error;
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
  if (error) throw error;
};

