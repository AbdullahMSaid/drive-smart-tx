-- Drive Smart TX — schema v4
-- Adds the pipeline processing_status column (kept separate from the owner's
-- manually editable lead_status) and the qualification_results columns the
-- owner portal reads. Run in Supabase → SQL Editor. Safe to re-run.

-- Pipeline state for the raw lead: new → deterministic → reviewed.
alter table rental_leads
  add column if not exists processing_status text default 'new';

alter table rental_leads drop constraint if exists rental_leads_processing_status_check;
alter table rental_leads add constraint rental_leads_processing_status_check
  check (processing_status is null or processing_status in ('new', 'deterministic', 'reviewed', 'failed'));

-- Deterministic engine output (and, later, the server-side AI review).
create table if not exists qualification_results (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references rental_leads(id) on delete cascade,
  rule_status text,
  rule_score int,
  rule_positive_signals jsonb,
  rule_risk_flags jsonb,
  rule_missing_info jsonb,
  rule_recommended_action text,
  rule_summary text,
  ai_summary text,
  ai_recommended_action text,
  created_at timestamptz not null default now()
);

alter table qualification_results
  add column if not exists ai_summary text,
  add column if not exists ai_recommended_action text,
  add column if not exists created_at timestamptz not null default now();

create index if not exists qualification_results_lead_id_idx
  on qualification_results (lead_id);

-- Data API access: owner (authenticated) reads, public form writes, service_role full.
grant select on qualification_results to authenticated;
grant insert on qualification_results to anon, authenticated;
grant all on qualification_results to service_role;

alter table qualification_results enable row level security;

drop policy if exists "Authenticated owners can read qualification results" on qualification_results;
create policy "Authenticated owners can read qualification results"
  on qualification_results for select
  to authenticated
  using (true);

-- The public intake form writes the deterministic result right after the lead
-- insert. Insert-only: visitors can never read qualification rows back.
drop policy if exists "Public form can insert qualification results" on qualification_results;
create policy "Public form can insert qualification results"
  on qualification_results for insert
  to anon, authenticated
  with check (true);

