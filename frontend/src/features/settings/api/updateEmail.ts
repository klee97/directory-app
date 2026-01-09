import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const updateEmail = async (currentPassword: string, newEmail: string) => {
  // Step 1: Verify current password via sign-in
  const { data: userData } = await supabase.auth.getUser();
  const currentEmail = userData.user?.email || '';

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: currentEmail,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error('Invalid password. Please check your password and try again.');
  }

  // Step 2: Attempt email update
  const { error: updateError } = await supabase.auth.updateUser({
    email: newEmail,
  }, {
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/partner/settings`,
  });

  // Step 3: Handle duplicate email errors
  if (updateError) {
    if (
      updateError.code === 'email_exists' ||
      updateError.message?.toLowerCase().includes('already registered')
    ) {
      console.debug(`Duplicate email error detected during email update for user: ${currentEmail}, newEmail: ${newEmail}`);
    } else {
      console.debug(`Email update error: ${updateError.message}`);
    }

    // We don't let user know if the email is already in use to avoid information leakage
    throw new Error('Failed to update email address.');
  }
};
