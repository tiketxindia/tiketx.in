-- Types
create type if not exists public.submission_stage as enum ('submission','onboarding','review','sales','closure');

-- Table
create table if not exists public.film_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  production_house_name text not null,
  film_title text not null,
  synopsis text not null,
  preview_link text not null,
  country text not null,
  expected_ticket_price text not null,
  planned_release_date date null,
  message text null,
  consent boolean not null default false,
  status_stage public.submission_stage not null default 'submission',
  submitted_at timestamptz not null default now()
);

-- Indexes
create index if not exists film_submissions_user_id_idx on public.film_submissions(user_id);
create index if not exists film_submissions_submitted_at_idx on public.film_submissions(submitted_at desc);

-- RLS
alter table public.film_submissions enable row level security;

-- Policies
create policy if not exists "insert_own_submission"
  on public.film_submissions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy if not exists "select_own_submissions"
  on public.film_submissions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy if not exists "update_own_submissions"
  on public.film_submissions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id); 