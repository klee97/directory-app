alter table public.inquiries
  add column reviewed_by uuid null references auth.users (id),
  add column reviewed_at timestamp with time zone null;