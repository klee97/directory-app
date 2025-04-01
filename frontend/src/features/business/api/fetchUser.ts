
import { createClient } from '@/lib/supabase/server';
import { transformBackendUserToFrontend } from '@/types/user';

export async function fetchUserById() {
  // Get current session to verify user is authenticated
  const supabase = await createClient();

  console.debug("Authenticating...");

  // Check if user is authenticated
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (!user || sessionError) {
    console.error("Authentication error:", sessionError || "No active session");
    throw new Error("You must be logged in to perform this action");
  }

  const { data: profile, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (userError) {
    console.error('Error fetching user: %s', userError);
    return null;
  }

  const { data: favorites, error: favoritesError } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', user.id);

  if (favoritesError) {
    console.error('Error fetching favorites: %s', favoritesError);
    return null;
  }

  return transformBackendUserToFrontend(profile, favorites ?? []);
}