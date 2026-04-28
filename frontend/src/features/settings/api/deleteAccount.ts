import { createBrowserClient } from '@/lib/supabase/clients/browserClient';

const supabaseBrowserClient = createBrowserClient();

export const deleteAccount = async (password: string) => {

  const { data, error: sessionError } = await supabaseBrowserClient.auth.getClaims();
  const user = data?.claims;

  if (!user || sessionError) {
    console.error("Authentication error:", sessionError || "No active session");
    return null;
  }
  const userId = user.sub;

  // First verify the password
  const { error: signInError } = await supabaseBrowserClient.auth.signInWithPassword({
    email: user?.email || '',
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
