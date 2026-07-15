-- Create new enum
create type unlock_method as enum (
  'paid',
  'admin_grant'
);

-- Rename enum values
alter type inquiry_status rename value 'new' to 'available';

alter type inquiry_status add value 'stalled';
alter type inquiry_status add value 'booked_trial_or_wedding'; --for legacy airtable

-- Add new columns
alter table inquiries
add column unlock_method unlock_method,
add column unlock_price numeric(10,2),
add column is_test_record boolean not null default false;

-- Update constraint
alter table inquiries
drop constraint outcome_requires_unlocked;

alter table inquiries
add constraint unlocked_requires_method check (
  inquiry_status <> 'unlocked'
  or unlock_method is not null
);

alter table inquiries enable row level security;

alter table inquiries
add column service_tag_ids uuid[] not null default '{}';

alter table inquiries drop column services;
drop type if exists service_type;

create index if not exists idx_inquiries_service_tag_ids
  on inquiries using gin (service_tag_ids);