-- FormForge core schema
-- Run this in Supabase SQL editor or as the first migration.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  protein_target numeric not null default 140,
  calorie_target numeric not null default 1800,
  water_target numeric not null default 80,
  step_target numeric not null default 8000,
  sleep_target numeric not null default 7.5,
  life_stage text not null default 'cycling' check (life_stage in ('cycling', 'perimenopause', 'postmenopause', 'other')),
  metabolic_support boolean not null default false,
  hormone_support boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  protein numeric not null default 0,
  calories numeric not null default 0,
  habits jsonb not null default '{"protein":false,"movement":false,"steps":false,"water":false,"sleep":false}'::jsonb,
  appetite integer not null default 3 check (appetite between 1 and 5),
  energy integer not null default 3 check (energy between 1 and 5),
  nausea integer not null default 0 check (nausea between 0 and 3),
  cycle_context text not null default 'none' check (cycle_context in ('period', 'follicular', 'ovulation', 'luteal', 'peri-meno', 'none')),
  symptoms text[] not null default '{}',
  note text not null default '',
  imported boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, log_date)
);

create table if not exists public.weekly_metrics (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  weight numeric,
  waist numeric,
  systolic integer,
  diastolic integer,
  resting_pulse integer,
  photo boolean not null default false,
  best_lift text not null default '',
  sessions jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

create table if not exists public.exercise_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  entry_date date not null,
  session_id text not null,
  exercise_id text not null,
  weight numeric not null check (weight >= 0),
  reps integer not null check (reps >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists exercise_entries_user_date_session_idx
  on public.exercise_entries(user_id, entry_date, session_id);

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.daily_logs enable row level security;
alter table public.weekly_metrics enable row level security;
alter table public.exercise_entries enable row level security;

create policy "profiles are private"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "settings are private"
  on public.settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily logs are private"
  on public.daily_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weekly metrics are private"
  on public.weekly_metrics for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "exercise entries are private"
  on public.exercise_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists settings_updated_at on public.settings;
create trigger settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

drop trigger if exists daily_logs_updated_at on public.daily_logs;
create trigger daily_logs_updated_at
  before update on public.daily_logs
  for each row execute function public.set_updated_at();

drop trigger if exists weekly_metrics_updated_at on public.weekly_metrics;
create trigger weekly_metrics_updated_at
  before update on public.weekly_metrics
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;

  insert into public.settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
