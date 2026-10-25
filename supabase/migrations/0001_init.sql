-- Matchday initial schema.
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
--
-- No accounts: the browser only holds the publishable key. Rows are readable
-- by everyone, but every write goes through the security definer functions at
-- the bottom, which check the secret tokens. Tokens are stored as SHA-256
-- hashes in tables that anon cannot read.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[0-9a-zA-Z]{8}$'),
  title text not null check (char_length(title) between 1 and 80),
  location text check (char_length(location) <= 120),
  start_date date not null,
  end_date date not null,
  start_time time not null,
  end_time time not null,
  duration_minutes integer not null
    check (duration_minutes between 30 and 480 and duration_minutes % 30 = 0),
  timezone text not null default 'Asia/Jerusalem',
  confirmed_slot text check (confirmed_slot ~ '^\d{4}-\d{2}-\d{2}T\d{2}:(00|30)$'),
  created_at timestamptz not null default now(),
  check (end_date >= start_date and end_date - start_date < 31),
  check (end_time > start_time)
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  availability text[] not null default '{}' check (cardinality(availability) <= 1500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index participants_event_id_idx on public.participants (event_id);

create table public.event_secrets (
  event_id uuid primary key references public.events (id) on delete cascade,
  admin_token_hash text not null
);

create table public.participant_secrets (
  participant_id uuid primary key references public.participants (id) on delete cascade,
  token_hash text not null
);

alter table public.events enable row level security;
alter table public.participants enable row level security;
alter table public.event_secrets enable row level security;
alter table public.participant_secrets enable row level security;

create policy "events are public" on public.events
  for select to anon, authenticated using (true);

create policy "participants are public" on public.participants
  for select to anon, authenticated using (true);

revoke insert, update, delete on public.events, public.participants
  from anon, authenticated;
revoke all on public.event_secrets, public.participant_secrets
  from anon, authenticated;

create function public.token_hash(p_token text)
returns text
language sql
immutable
set search_path = ''
as $$
  select encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
$$;

create function public.create_event(
  p_slug text,
  p_admin_token text,
  p_title text,
  p_location text,
  p_start_date date,
  p_end_date date,
  p_start_time time,
  p_end_time time,
  p_duration_minutes integer,
  p_timezone text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id uuid;
begin
  if char_length(p_admin_token) < 32 then
    raise exception 'admin token too short' using errcode = '22023';
  end if;
  perform now() at time zone p_timezone;

  insert into public.events (
    slug, title, location, start_date, end_date,
    start_time, end_time, duration_minutes, timezone
  ) values (
    p_slug, p_title, nullif(p_location, ''), p_start_date, p_end_date,
    p_start_time, p_end_time, p_duration_minutes, p_timezone
  ) returning id into v_event_id;

  insert into public.event_secrets (event_id, admin_token_hash)
  values (v_event_id, public.token_hash(p_admin_token));
end;
$$;

create function public.submit_availability(
  p_slug text,
  p_participant_token text,
  p_name text,
  p_availability text[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id uuid;
  v_participant_id uuid;
begin
  if char_length(p_participant_token) < 32 then
    raise exception 'participant token too short' using errcode = '22023';
  end if;
  if exists (
    select 1 from unnest(p_availability) as slot
    where slot !~ '^\d{4}-\d{2}-\d{2}T\d{2}:(00|30)$'
  ) then
    raise exception 'invalid slot key' using errcode = '22023';
  end if;

  select id into v_event_id from public.events where slug = p_slug;
  if v_event_id is null then
    raise exception 'event not found' using errcode = 'P0002';
  end if;

  select p.id into v_participant_id
  from public.participants p
  join public.participant_secrets s on s.participant_id = p.id
  where p.event_id = v_event_id
    and s.token_hash = public.token_hash(p_participant_token);

  if v_participant_id is null then
    insert into public.participants (event_id, name, availability)
    values (v_event_id, p_name, p_availability)
    returning id into v_participant_id;

    insert into public.participant_secrets (participant_id, token_hash)
    values (v_participant_id, public.token_hash(p_participant_token));
  else
    update public.participants
    set name = p_name, availability = p_availability, updated_at = now()
    where id = v_participant_id;
  end if;

  return v_participant_id;
end;
$$;

create function public.confirm_slot(
  p_slug text,
  p_admin_token text,
  p_slot text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.events e
  set confirmed_slot = p_slot
  from public.event_secrets s
  where e.slug = p_slug
    and s.event_id = e.id
    and s.admin_token_hash = public.token_hash(p_admin_token);

  if not found then
    raise exception 'invalid admin token' using errcode = '42501';
  end if;
end;
$$;

revoke execute on function public.token_hash(text) from public, anon, authenticated;
revoke execute on function public.create_event(text, text, text, text, date, date, time, time, integer, text) from public;
revoke execute on function public.submit_availability(text, text, text, text[]) from public;
revoke execute on function public.confirm_slot(text, text, text) from public;

grant execute on function public.create_event(text, text, text, text, date, date, time, time, integer, text) to anon, authenticated;
grant execute on function public.submit_availability(text, text, text, text[]) to anon, authenticated;
grant execute on function public.confirm_slot(text, text, text) to anon, authenticated;

alter publication supabase_realtime add table public.events, public.participants;
