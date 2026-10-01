import { createServerClient } from "@/lib/supabase/clients/serverClient";
import { getUserRole, isAdminRole } from "@/lib/auth/userRole";
import { apiFail } from "../api/respond";

export interface AdminAuthResult {
  user: { id: string; email: string | null };
  // Same authenticated client the admin check ran against — reuse this for
  // any subsequent queries in the route instead of creating a second one.
  supabase: Awaited<ReturnType<typeof createServerClient>>;
}

export class UnauthorizedError extends Error { }
export class ForbiddenError extends Error { }

/**
 * Verifies the requester is signed in and has the admin role, via the same
 * `profiles.role` lookup (and the same `getUserRole`/`isAdminRole` helpers)
 * used elsewhere — e.g. the `login` server action and `useRequireAdmin` —
 * so "admin" means one thing across the client hook and this API check.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError("Not signed in");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("vendor_id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // Signed in, but no profile row — treat as not-admin rather than a 500;
    // an admin should always have a profile, so this is a data problem, not
    // a case to silently pass.
    throw new ForbiddenError("No profile found for user");
  }

  if (!isAdminRole(getUserRole(profile))) {
    throw new ForbiddenError("Not an admin");
  }

  return { user: { id: user.id, email: user.email ?? null }, supabase };
}

export function authErrorResponse(err: unknown) {
  if (err instanceof UnauthorizedError) return apiFail("unauthorized");
  if (err instanceof ForbiddenError) return apiFail("forbidden");
  throw err;
}