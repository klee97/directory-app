import { createBrowserClient } from '@/lib/supabase/clients/browserClient';

const supabaseBrowserClient = createBrowserClient();

export const deleteAccount = async (userEmail: string, userId: string, password: string) => {

  // First verify the password
  const { error: signInError } = await supabaseBrowserClient.auth.signInWithPassword({
    email: userEmail,
    password,
  });

  if (signInError) throw signInError;

  // Delete user's favorites first (due to foreign key constraint)
  const { error: favoritesError } = await supabaseBrowserClient
    .from('user_favorites')
    .delete()
    .eq('user_id', userId);

  if (favoritesError) throw favoritesError;

  // Delete user's profile
  const { error: profileError } = await supabaseBrowserClient
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) throw profileError;

  // Finally delete the auth account


  const { error: deleteError } = await supabaseBrowserClient.rpc('delete_user'); //await supabase.auth.admin.deleteUser(userId);

  if (deleteError) throw deleteError;

  // Sign out
  await supabaseBrowserClient.auth.signOut();
};
