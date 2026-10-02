-- Closes a privilege-escalation path: "Users can update own profile" (RLS)
-- gates which ROWS a user can touch, not which COLUMNS — Postgres RLS has
-- no concept of per-column restriction via USING/WITH CHECK. As written,
-- any authenticated user can update their own profiles row, including
-- `role`, and `role` is exactly what requireAdmin()/isAdminRole() trust to
-- gate the new inquiry review endpoints (and, per the "Admins can ..."
-- policies, inquiries access itself).
--
-- A column-level REVOKE does NOT fix this: if `authenticated` already holds
-- a table-wide UPDATE grant on profiles (Supabase's default), that grant
-- permits writing any column regardless of a narrower column-level revoke
-- sitting next to it. A trigger enforces the rule independently of grants
-- and RLS, so it holds regardless of how those are configured.
--
-- Admin role grants currently only happen via direct database access (e.g.
-- the Supabase SQL editor / dashboard), which connects as a Postgres role
-- other than `authenticated`/`anon` — so this trigger does not block that
-- existing process. It only blocks role changes arriving through a normal
-- client session (the app, or a handcrafted request using a user's own
-- auth token).
create or replace function public.prevent_profile_role_self_escalation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and current_user in ('authenticated', 'anon') then
    raise exception
      'Changing profiles.role requires direct database access; it cannot be set via a client session (attempted by Postgres role "%").',
      current_user;
  end if;
  return new;
end;
$$;
 
drop trigger if exists prevent_profile_role_self_escalation on public.profiles;
 
create trigger prevent_profile_role_self_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_profile_role_self_escalation();