import { createBrowserClient } from '@/lib/supabase/clients/browserClient';
import { getBaseUrl } from '@/lib/env/env';

const supabaseBrowserClient = createBrowserClient();

export const updateEmail = async (currentPassword: string, newEmail: string, isVendor: boolean) => {
  const { data, error: sessionError } = await supabaseBrowserClient.auth.getClaims();

  if (!data?.claims?.email || sessionError) {
    throw new Error("You must be logged in to perform this action");
  }

  const { email: currentEmail } = data.claims;

  // Step 1: Verify current password via log-in
  const { error: signInError } = await supabaseBrowserClient.auth.signInWithPassword({
    email: currentEmail,
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
      console.debug(`Duplicate email error detected during email update for user: ${currentEmail}, newEmail: ${newEmail}`);
    } else {
      console.debug(`Email update error: ${updateError.message}`);
    }

    // We don't let user know if the email is already in use to avoid information leakage
    throw new Error('Failed to update email address.');
  }
};
