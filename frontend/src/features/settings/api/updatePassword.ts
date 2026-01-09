import { createClient } from '@/lib/supabase/client';

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
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/partner/login`
    : `${process.env.NEXT_PUBLIC_SITE_URL}/login`;
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

