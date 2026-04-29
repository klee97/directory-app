import { createBrowserClient } from '@/lib/supabase/clients/browserClient';

const supabaseBrowserClient = createBrowserClient();

export const deleteAccount = async (userEmail: string, userId: string, password: string) => {

  // First verify the password
  const { error: signInError } = await supabaseBrowserClient.auth.signInWithPassword({
    email: userEmail,
    password,
  });

  if (signInError) {
    return { error: 'Invalid password. Please check your password and try again.' };
  }

  // Delete user's favorites first (due to foreign key constraint)
  const { error: favoritesError } = await supabaseBrowserClient
    .from('user_favorites')
    .delete()
    .eq('user_id', userId);

  if (favoritesError) {
    return { error: 'Failed to delete user favorites. Please try again later.' };
  }

  // Delete user's profile
  const { error: profileError } = await supabaseBrowserClient
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    return { error: 'Failed to delete user profile. Please try again later.' };
  }


  // Finally delete the auth account
  const { error: deleteError } = await supabaseBrowserClient.rpc('delete_user'); //await supabase.auth.admin.deleteUser(userId);

  if (deleteError) {
    return { error: 'Failed to delete user account. Please try again later.' };
  }

  // Sign out
  await supabaseBrowserClient.auth.signOut();
};
