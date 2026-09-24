-- Migration: rename/retype inquiries.service_tag_ids (uuid[]) -> services (text[])
--
-- service_tag_ids has no FK to public.tags and, per team confirmation, was
-- never actually written to (unused column). The join below would silently
-- drop any id with no matching tags row before the column is dropped, which
-- would be unrecoverable. Rather than rely on "it's unused" as an assumption,
-- this preflight check proves it against whichever database the migration
-- actually runs against, and aborts before anything destructive happens if
-- that assumption doesn't hold there.
do $$
declare
  orphaned_count integer;
begin
  select count(*) into orphaned_count
  from public.inquiries
  where service_tag_ids is not null
    and array_length(service_tag_ids, 1) > 0
    and exists (
      select 1
      from unnest(service_tag_ids) as tag_id
      where not exists (select 1 from public.tags where tags.id = tag_id)
    );

  if orphaned_count > 0 then
    raise exception
      'Aborting migration: % inquiries reference a service_tag_ids value with no matching public.tags row. Resolve before rerunning.',
      orphaned_count;
  end if;
end $$;

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