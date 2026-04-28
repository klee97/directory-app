import { createBrowserClient } from '@/lib/supabase/clients/browserClient';
import { getBaseUrl } from '@/lib/env/env';
import { CurrentUser, getCurrentUser } from '@/lib/auth/getUser';

const supabaseBrowserClient = createBrowserClient();

export const updateEmail = async (currentPassword: string, newEmail: string, isVendor: boolean) => {
  const currentUser: CurrentUser | null = await getCurrentUser();
  if (!currentUser || !currentUser.email) {
    throw new Error("You must be logged in to perform this action");
  }

  // Step 1: Verify current password via log-in
  const { error: signInError } = await supabaseBrowserClient.auth.signInWithPassword({
    email: currentUser.email,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error('Invalid password. Please check your password and try again.');
  }

  // Step 2: Attempt email update
  const { error: updateError } = await supabaseBrowserClient.auth.updateUser({
    email: newEmail,
  }, {
    emailRedirectTo: `${getBaseUrl()}${isVendor ? '/partner/dashboard' : '/settings'}`,
  });

  // Step 3: Handle duplicate email errors
  if (updateError) {
    if (
      updateError.code === 'email_exists' ||
      updateError.message?.toLowerCase().includes('already registered')
    ) {
      console.debug(`Duplicate email error detected during email update for user: ${currentUser.email}, newEmail: ${newEmail}`);
    } else {
      console.debug(`Email update error: ${updateError.message}`);
    }

    // We don't let user know if the email is already in use to avoid information leakage
    throw new Error('Failed to update email address.');
  }
};
