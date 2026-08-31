import { createServerClient } from "@/lib/supabase/clients/serverClient";
import { cache } from "react";
import { UserRole, getUserRole } from "@/lib/auth/userRole";

export type ServerAuthState = {
  isLoggedIn: boolean;
  userId: string | null;
  email: string | null;
  role: UserRole;
  vendorId: string | null;
};

export const getServerAuthState = cache(async (): Promise<ServerAuthState> => {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    if (error) console.error('getServerAuthState failed:', error);
    return { isLoggedIn: false, userId: null, email: null, role: UserRole.USER, vendorId: null };
  }

  const claims = data.claims;
  const userId = claims.sub as string;
  const email = claims.email as string;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, vendor_id')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('getServerAuthState: failed to load profile for', userId, profileError);
  }

  return {
    isLoggedIn: true,
    userId,
    email,
    role: getUserRole({ vendor_id: profile?.vendor_id, role: profile?.role }),
    vendorId: profile?.vendor_id ?? null,
  };
});