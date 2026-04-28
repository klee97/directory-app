
import { createServerClient } from '@/lib/supabase/clients/serverClient';
import { transformBackendUserToFrontend } from '@/types/user';

export async function fetchUserById() {
  // Get current session to verify user is authenticated
  const supabaseServerClient = await createServerClient();

  console.debug("Authenticating...");

  // Check if user is authenticated
  const { data, error: sessionError } = await supabaseServerClient.auth.getClaims();
  const user = data?.claims;

  if (!user || sessionError) {
    console.error("Authentication error:", sessionError || "No active session");
    return null;
  }

  const { data: profile, error: userError } = await supabaseServerClient
    .from('profiles')
    .select('*')
    .eq('id', user.sub)
    .single();

  if (userError) {
    console.error('Error fetching user: %s', userError);
    return null;
  }

  const { data: favorites, error: favoritesError } = await supabaseServerClient
    .from('user_favorites')
    .select('*')
    .eq('user_id', user.sub);

  if (favoritesError) {
    console.error('Error fetching favorites: %s', favoritesError);
    return null;
  }

  return transformBackendUserToFrontend(profile, favorites ?? []);
}