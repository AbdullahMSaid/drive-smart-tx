-- Drive Smart TX — schema v5
-- Structured AI review fields and audit support. Run after schema-v4.sql.
-- Safe to re-run.

alter table qualification_results
  add column if not exists ai_priority text,
  add column if not exists ai_inconsistencies jsonb,
  add column if not exists ai_additional_risk_flags jsonb,
  add column if not exists ai_missing_information jsonb,
  add column if not exists ai_suggested_customer_reply text,
  add column if not exists final_status text,
  add column if not exists decision_reason text,
  add column if not exists model_name text,
  add column if not exists prompt_version text,
  add column if not exists input_tokens int,
  add column if not exists output_tokens int,
  add column if not exists estimated_ai_cost numeric;

alter table qualification_results drop constraint if exists qualification_results_ai_priority_check;
alter table qualification_results add constraint qualification_results_ai_priority_check
  check (ai_priority is null or ai_priority in ('high', 'normal', 'low', 'manual_review'));

alter table qualification_results drop constraint if exists qualification_results_final_status_check;
alter table qualification_results add constraint qualification_results_final_status_check
  check (final_status is null or final_status in ('high', 'normal', 'low', 'manual_review', 'not_eligible'));

create table if not exists processing_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references rental_leads(id) on delete cascade,
  step_name text not null,
  status text not null check (status in ('ok', 'error', 'retry')),
  message text,
  created_at timestamptz not null default now()
);

create index if not exists processing_events_lead_id_idx
  on processing_events (lead_id);

grant all on processing_events to service_role;
alter table processing_events enable row level security;

alter table rental_leads drop constraint if exists rental_leads_processing_status_check;
alter table rental_leads add constraint rental_leads_processing_status_check
  check (processing_status is null or processing_status in
    ('new', 'processing', 'deterministic', 'qualified', 'manual_review', 'reviewed', 'error', 'failed'));

-- The public site and owner portal share one Supabase browser session. An
-- owner who tests the public form therefore submits as `authenticated`, not
-- `anon`. Keep this insert-only policy available to both roles; neither role
-- receives public read access from this policy.
grant insert on rental_leads to anon, authenticated;
drop policy if exists "public can insert leads" on rental_leads;
create policy "public can insert leads"
  on rental_leads for insert
  to anon, authenticated
  with check (true);
