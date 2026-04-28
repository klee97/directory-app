
import { CurrentUser, getCurrentUser } from '@/lib/auth/getUser';
import { createServerClient } from '@/lib/supabase/clients/serverClient';
import { transformBackendUserToFrontend } from '@/types/user';

export async function fetchUserById() {
  const currentUser: CurrentUser | null = await getCurrentUser();
  if (!currentUser) {
    console.error("Authentication error: No active session");
    return null;
  }
  
  const supabaseServerClient = await createServerClient();

  const { data: profile, error: userError } = await supabaseServerClient
    .from('profiles')
    .select('*')
    .eq('id', currentUser.userId)
    .single();

  if (userError) {
    console.error('Error fetching user: %s', userError);
    return null;
  }

  const { data: favorites, error: favoritesError } = await supabaseServerClient
    .from('user_favorites')
    .select('*')
    .eq('user_id', currentUser.userId);

  if (favoritesError) {
    console.error('Error fetching favorites: %s', favoritesError);
    return null;
  }

  return transformBackendUserToFrontend(profile, favorites ?? []);
}