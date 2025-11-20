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

export const updatePasswordAfterReset = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    data: {
      has_password: 'true'
    }
  });
  if (error) throw error;
};

