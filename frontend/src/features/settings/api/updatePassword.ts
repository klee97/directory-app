import { createBrowserClient } from '@/lib/supabase/clients/browserClient';
import { getBaseUrl } from '@/lib/env/env';
import { CurrentUser, getCurrentUser } from '@/lib/auth/getUser';

const supabase = createBrowserClient();

export const updatePassword = async (currentPassword: string, newPassword: string) => {
  const currentUser: CurrentUser | null = await getCurrentUser();
  if (!currentUser || !currentUser.email) {
    throw new Error("You must be logged in to perform this action");
  }

  // First verify the current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: currentUser.email,
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

