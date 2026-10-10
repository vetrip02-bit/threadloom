-- ===========================================================================
-- Threadloom — Supabase schema
-- Run once: Supabase Studio -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run.
-- ===========================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'customer_type') then
    create type public.customer_type as enum (
      'School / College', 'Corporate', 'Hospitality',
      'Event agency', 'Sports team', 'Reseller', 'Other'
    );
  end if;
end
$$;

-- Non-secret profile data only. Passwords live in auth.users, managed by
-- Supabase Auth — never copy a password or a hash into this table.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  first_name    text        not null default '',
  last_name     text        not null default '',
  email         text        not null,
  phone         text,
  organization  text,
  customer_type public.customer_type,
  city          text,
  consent_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint profiles_first_name_len check (char_length(first_name) <= 60),
  constraint profiles_last_name_len  check (char_length(last_name)  <= 60),
  constraint profiles_email_len      check (char_length(email)      <= 254),
  constraint profiles_phone_len      check (phone is null or char_length(phone) <= 16),
  constraint profiles_org_len        check (organization is null or char_length(organization) <= 120),
  constraint profiles_city_len       check (city is null or char_length(city) <= 80)
);

create index if not exists profiles_email_idx on public.profiles (lower(email));

-- Row Level Security: a signed-in user can only touch their own row.
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by their owner" on public.profiles;
create policy "Profiles are viewable by their owner"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Profiles are updatable by their owner" on public.profiles;
create policy "Profiles are updatable by their owner"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Profiles are insertable by their owner" on public.profiles;
create policy "Profiles are insertable by their owner"
  on public.profiles for insert with check (auth.uid() = id);

-- Seed the profile from sign-up metadata, in the same transaction as the user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta_customer_type text := new.raw_user_meta_data ->> 'customer_type';
begin
  insert into public.profiles (
    id, first_name, last_name, email, phone, organization, customer_type, city, consent_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'organization',
    case
      when meta_customer_type is null then null
      when meta_customer_type = any (enum_range(null::public.customer_type)::text[])
        then meta_customer_type::public.customer_type
      else null
    end,
    new.raw_user_meta_data ->> 'city',
    nullif(new.raw_user_meta_data ->> 'consent_at', '')::timestamptz
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profiles.email in step with a verified email change.
create or replace function public.handle_user_email_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email, updated_at = now() where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
