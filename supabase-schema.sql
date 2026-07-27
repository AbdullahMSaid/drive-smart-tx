-- Run this in your Supabase project's SQL editor.
-- Creates rental_leads + qualification_results, grants Data API access,
-- and allows anonymous (public website) inserts only.

create table if not exists public.rental_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  submission_id text not null unique,
  submitted_at timestamptz not null,

  -- Contact
  full_name text not null,
  phone text not null,
  email text not null,
  contact_method text not null,

  -- Rental
  vehicle_id text,
  vehicle_name text,
  vehicle_category text not null,
  pickup_date date,
  pickup_time text,
  return_date date,
  return_time text,
  pickup_preference text,
  rental_purpose text,
  pickup_area text,
  notes text,
  rental_duration_days integer,

  -- Qualification answers
  meets_age text,
  has_license text,
  license_suspended text,
  has_insurance text,
  rented_before text,
  driving_history text,
  will_provide_docs text,
  deposit_ready text,
  urgency text,

  -- Consents
  consent_not_reservation boolean not null default false,
  consent_contact boolean not null default false,
  consent_accurate boolean not null default false
);

create table if not exists public.qualification_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references public.rental_leads(id) on delete cascade,

  status text not null,
  score integer not null,
  positive_signals text[] not null default '{}',
  risk_flags text[] not null default '{}',
  missing_info text[] not null default '{}',
  recommended_next_action text,
  summary text
);

create index if not exists qualification_results_lead_id_idx
  on public.qualification_results(lead_id);

-- Data API grants (required)
grant insert on public.rental_leads to anon;
grant insert on public.qualification_results to anon;
grant select, insert, update, delete on public.rental_leads to authenticated;
grant select, insert, update, delete on public.qualification_results to authenticated;
grant all on public.rental_leads to service_role;
grant all on public.qualification_results to service_role;

alter table public.rental_leads enable row level security;
alter table public.qualification_results enable row level security;

-- Public website may submit leads, but never read them back.
create policy "Anyone can submit a lead"
  on public.rental_leads for insert to anon, authenticated
  with check (true);

create policy "Anyone can submit qualification results"
  on public.qualification_results for insert to anon, authenticated
  with check (true);
