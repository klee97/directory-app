-- Create inquiries table (migrated from Airtable "Leads")

create type inquiry_status as enum (
  'pending_review',
  'new',
  'unlocked',
  'declined',
  'expired'
);

create type outcome_status as enum (
  'contacted',
  'booked_trial',
  'booked_wedding',
  'no_response',
  'lost'
);

create type service_type as enum (
  'hair',
  'makeup'
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  vendor_id text not null references vendors(id),
  airtable_record_id text unique,

  inquiry_status inquiry_status not null default 'pending_review',
  outcome_status outcome_status,

  submitted_at timestamptz not null,
  wedding_date date,
  is_wedding_date_flexible boolean not null default false,
  location text,
  budget numeric(10,2),
  is_budget_flexible boolean not null default false,
  services service_type[] not null default '{}',
  people_count int,
  is_people_count_flexible boolean not null default false,
  bride_first_name text,

  -- Post-unlock fields
  makeup_styles text[],
  bride_last_name text,
  bride_email text,
  message text,

  contacted_at timestamptz,
  expires_at timestamptz,
  unlocked_at timestamptz,
  declined_at timestamptz,
  booked_trial_at timestamptz,
  booked_wedding_at timestamptz,

  stripe_payment_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- outcome_status can only be set once the inquiry has been unlocked
  constraint outcome_requires_unlocked check (
    outcome_status is null or inquiry_status = 'unlocked'
  )
);

create index if not exists idx_inquiries_vendor_id on inquiries (vendor_id);
create index if not exists idx_inquiries_inquiry_status on inquiries (inquiry_status);
create index if not exists idx_inquiries_submitted_at on inquiries (submitted_at);

-- keep updated_at current on every row change
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger inquiries_set_updated_at
before update on inquiries
for each row
execute function set_updated_at();