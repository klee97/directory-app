alter table public.inquiries enable row level security;

-- security definer so the profiles lookup doesn't trip over profiles' own RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'admin'   -- match whatever isAdminRole() checks
  );
$$;

grant execute on function public.is_admin() to authenticated;

create policy "Admins can read inquiries"
  on public.inquiries for select to authenticated
  using (public.is_admin());

create policy "Admins can update inquiries"
  on public.inquiries for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());