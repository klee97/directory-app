import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const deleteAccount = async (password: string) => {
  // First verify the password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: (await supabase.auth.getUser()).data.user?.email || '',
    password,
  });

  if (signInError) throw signInError;

  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User ID not found');

  // Delete user's favorites first (due to foreign key constraint)
  const { error: favoritesError } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId);

  if (favoritesError) throw favoritesError;

  // Delete user's profile
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) throw profileError;

  // Finally delete the auth account


  const { error: deleteError } = await supabase.rpc('delete_user'); //await supabase.auth.admin.deleteUser(userId);

  if (deleteError) throw deleteError;

  // Sign out
  await supabase.auth.signOut();
};
