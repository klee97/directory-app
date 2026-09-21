-- Migration: rename/retype inquiries.service_tag_ids (uuid[]) -> services (text[])

alter table public.inquiries
  add column services text[];

update public.inquiries
set services = (
  select array_agg(tags.display_name order by tags.display_name)
  from unnest(inquiries.service_tag_ids) as tag_id
  join public.tags on tags.id = tag_id
)
where service_tag_ids is not null
  and array_length(service_tag_ids, 1) > 0;

alter table public.inquiries
  drop column service_tag_ids;