import { CurrentUser, getCurrentUser } from '@/lib/auth/getUser';
import { createBrowserClient } from '@/lib/supabase/clients/browserClient';

const supabaseBrowserClient = createBrowserClient();

export const deleteAccount = async (password: string) => {

  const currentUser: CurrentUser | null = await getCurrentUser();
  if (!currentUser) {
    console.error("Authentication error: No active session");
    return null;
  }

  // First verify the password
  const { error: signInError } = await supabaseBrowserClient.auth.signInWithPassword({
    email: currentUser.email || '',
    password,
  });

  if (signInError) throw signInError;

  // Delete user's favorites first (due to foreign key constraint)
  const { error: favoritesError } = await supabaseBrowserClient
    .from('user_favorites')
    .delete()
    .eq('user_id', currentUser.userId);

  if (favoritesError) throw favoritesError;

  // Delete user's profile
  const { error: profileError } = await supabaseBrowserClient
    .from('profiles')
    .delete()
    .eq('id', currentUser.userId);

  if (profileError) throw profileError;

  // Finally delete the auth account


  const { error: deleteError } = await supabaseBrowserClient.rpc('delete_user'); //await supabase.auth.admin.deleteUser(userId);

  if (deleteError) throw deleteError;

  // Sign out
  await supabaseBrowserClient.auth.signOut();
};
