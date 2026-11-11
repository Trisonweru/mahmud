-- Backend account management: account status (soft delete / suspend) + credential audit trail.

alter table public.profiles
  add column if not exists status text not null default 'active',
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid;

do $$ begin
  alter table public.profiles add constraint profiles_status_check check (status in ('active', 'suspended', 'deleted'));
exception when duplicate_object then null; end $$;

-- Staff can still edit their own profile row, but never their own status / email / deletion fields.
-- Those are only changed by the server (service role) after authorization checks.
create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') and (
       new.status is distinct from old.status
    or new.email is distinct from old.email
    or new.deleted_at is distinct from old.deleted_at
    or new.deleted_by is distinct from old.deleted_by
  ) then
    raise exception 'Account status and login email can only be changed by a super administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_admin_fields on public.profiles;
create trigger protect_profile_admin_fields
  before update on public.profiles
  for each row execute function public.protect_profile_admin_fields();

-- Append-only audit log of every credential / account change.
create table if not exists public.account_audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_id uuid,
  actor_email text,
  target_id uuid,
  target_email text,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text
);

create index if not exists account_audit_log_created_at_idx on public.account_audit_log (created_at desc);
create index if not exists account_audit_log_target_idx on public.account_audit_log (target_id);

alter table public.account_audit_log enable row level security;

-- Only super admins can read the log. No insert/update/delete policies: rows are written
-- by the server with the service role and can never be edited or removed from the app.
drop policy if exists superadmin_read_account_audit on public.account_audit_log;
create policy superadmin_read_account_audit on public.account_audit_log
  for select to authenticated using (public.is_super_admin(auth.uid()));

revoke insert, update, delete on public.account_audit_log from anon, authenticated;
