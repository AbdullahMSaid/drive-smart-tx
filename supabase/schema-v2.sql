-- Drive Smart TX — schema v2
-- Matches the real LeadFormData shape from src/lib/lead-qualification.ts
-- Run in Supabase → SQL Editor on royalty-luxury-dev.

-- 1. rental_leads: raw form submission, all steps
create table if not exists rental_leads (
  id uuid primary key default gen_random_uuid(),
  submission_id text unique not null,        -- LSR-XXXX-XXXXXX from the app
  created_at timestamptz not null default now(),
  submitted_at timestamptz not null default now(),

  -- Step 0: Contact
  full_name text not null,
  phone text not null,
  email text not null,
  contact_method text not null check (contact_method in ('phone', 'text', 'email')),

  -- Step 1: Rental
  vehicle_id text,
  vehicle_name text,
  vehicle_category text not null check (vehicle_category in ('economy', 'premium', 'unsure')),
  pickup_date date not null,
  pickup_time text not null,
  return_date date not null,
  return_time text not null,
  rental_duration_days int,
  pickup_preference text not null check (pickup_preference in ('pickup', 'delivery')),
  rental_purpose text not null,
  pickup_area text,
  notes text,

  -- Step 2: Qualification (raw answers)
  meets_age text not null check (meets_age in ('yes', 'no')),
  has_license text not null check (has_license in ('yes', 'no')),
  license_suspended text not null check (license_suspended in ('yes', 'no')),
  has_insurance text not null check (has_insurance in ('yes', 'no', 'unsure')),
  rented_before text not null check (rented_before in ('yes', 'no')),
  driving_history text not null check (driving_history in ('no', 'yes', 'discuss')),
  will_provide_docs text not null check (will_provide_docs in ('yes', 'no')),
  deposit_ready text not null check (deposit_ready in ('yes', 'no', 'need-pricing')),
  urgency text not null check (urgency in ('immediate', 'within-week', 'within-two-weeks', 'later', 'researching')),

  -- Step 3: Review consent
  consent_not_reservation boolean not null,
  consent_contact boolean not null,
  consent_accurate boolean not null,

  -- Pipeline status
  processing_status text not null default 'new'
    check (processing_status in ('new', 'processing', 'qualified', 'manual_review', 'error'))
);

-- 2. qualification_results: output of qualifyLead() now, AI enrichment later
create table if not exists qualification_results (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references rental_leads(id) on delete cascade,

  -- From the existing deterministic qualifyLead() engine
  rule_status text check (rule_status in ('high-priority', 'needs-review', 'missing-info', 'not-eligible')),
  rule_score int,
  rule_positive_signals jsonb,
  rule_risk_flags jsonb,
  rule_missing_info jsonb,
  rule_recommended_action text,
  rule_summary text,

  -- Reserved for when runAiLeadQualification() does real model calls
  ai_priority text check (ai_priority in ('high', 'normal', 'low', 'manual_review')),
  ai_summary text,
  ai_recommended_action text,
  ai_suggested_customer_reply text,
  model_name text,
  prompt_version text,
  input_tokens int,
  output_tokens int,
  estimated_ai_cost numeric,
  created_at timestamptz not null default now()
);

-- 3. processing_events: debugging / audit trail
create table if not exists processing_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references rental_leads(id) on delete cascade,
  step_name text not null,
  status text not null check (status in ('ok', 'error', 'retry')),
  message text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_qualification_results_lead_id on qualification_results(lead_id);
create index if not exists idx_processing_events_lead_id on processing_events(lead_id);
create index if not exists idx_rental_leads_status on rental_leads(processing_status);
create index if not exists idx_rental_leads_submission_id on rental_leads(submission_id);

-- Row Level Security
alter table rental_leads enable row level security;
alter table qualification_results enable row level security;
alter table processing_events enable row level security;

-- Public form can insert a lead, but never read, update, or delete any row —
-- including rows it just inserted. No public policies exist on
-- qualification_results or processing_events at all.
create policy "public can insert leads"
  on rental_leads for insert
  to anon
  with check (true);

-- All reads/updates (for the qualification pipeline, owner dashboard, etc.)
-- go through the secret/service_role key server-side, which bypasses RLS.
