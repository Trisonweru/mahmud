-- Single shared backend for multiple public websites.
-- Every application records which website it was submitted from.
-- Existing applications all came from eVisaSomali.com.

alter table public.applications
  add column if not exists source_site text not null default 'evisasomali.com';

do $$ begin
  alter table public.applications add constraint applications_source_site_check
    check (source_site in ('evisasomali.com', 'evisasomalia.com', 'somaliavisa.net'));
exception when duplicate_object then null; end $$;

create index if not exists applications_source_site_idx on public.applications (source_site);
