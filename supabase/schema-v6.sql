-- Drive Smart TX — schema v6
-- Run in Supabase → SQL Editor after schema-v5.sql. Safe to re-run.
--
-- ⚠ REQUIRED BEFORE THE SHORTENED FORM WORKS.
-- license_suspended, rented_before, and deposit_ready are currently NOT NULL
-- with no default. The shortened intake form no longer collects them and
-- correctly omits them rather than inventing answers, so every submission will
-- fail with a not-null violation until part 3 below has been applied. Part 4
-- (waitlist_signups) is likewise required before any waitlist button can save.
--
-- This migration does four things:
--   1. Locks down the over-broad table grants that Supabase's defaults created.
--   2. Drops the duplicate lead_id indexes left behind by v2 + v4/v5.
--   3. Relaxes the intake columns whose form questions were retired, so the
--      shortened form can stop writing them without breaking the insert.
--   4. Adds waitlist_signups for visitors who aren't ready to rent yet.
--
-- Retired intake columns are deliberately KEPT (not dropped) so historical
-- leads retain their answers. The app simply stops writing them.

-- ============================================================
-- 1. Grants — least privilege
-- ============================================================
-- Supabase's project defaults grant ALL privileges on every public table to
-- anon and authenticated. RLS was the only thing preventing anonymous reads and
-- deletes, and RLS does NOT cover TRUNCATE. Narrow the grants to exactly what
-- the app needs so RLS is defense-in-depth rather than the sole control.

revoke all on rental_leads from anon, authenticated;
revoke all on qualification_results from anon, authenticated;
revoke all on processing_events from anon, authenticated;

-- Public intake form + owner portal.
grant insert on rental_leads to anon, authenticated;
grant select, update on rental_leads to authenticated;

-- The intake form writes the deterministic result; the owner reads it.
grant insert on qualification_results to anon, authenticated;
grant select on qualification_results to authenticated;

-- processing_events stays server-only: no anon/authenticated grant at all.
grant all on rental_leads, qualification_results, processing_events to service_role;

-- ROOT CAUSE (left commented on purpose): the grants above fix today's tables,
-- but Supabase's default privileges will re-grant ALL on any table created
-- later. Uncommenting the line below fixes that going forward — but it also
-- means new tables get no anon/authenticated access until you grant it
-- explicitly, which can look like a broken app if you forget. Enable it only if
-- you're comfortable granting per table from now on.
--
-- alter default privileges in schema public revoke all on tables from anon, authenticated;

-- ============================================================
-- 2. Duplicate indexes
-- ============================================================
-- v2 and v4/v5 each created a lead_id index under a different name, so both
-- tables carried two identical btrees. Keep the v4/v5 names.
drop index if exists idx_qualification_results_lead_id;
drop index if exists idx_processing_events_lead_id;

-- ============================================================
-- 3. Retired intake questions
-- ============================================================
-- These columns were NOT NULL from v2. The shortened form no longer collects
-- them, so drop the NOT NULL rather than writing placeholder values.
alter table rental_leads alter column license_suspended drop not null;
alter table rental_leads alter column rented_before     drop not null;
alter table rental_leads alter column deposit_ready     drop not null;

-- Their check constraints rejected NULL implicitly by being NOT NULL; make the
-- NULL case explicit so the constraints stay valid for new short-form rows.
alter table rental_leads drop constraint if exists rental_leads_license_suspended_check;
alter table rental_leads add constraint rental_leads_license_suspended_check
  check (license_suspended is null or license_suspended in ('yes', 'no'));

alter table rental_leads drop constraint if exists rental_leads_rented_before_check;
alter table rental_leads add constraint rental_leads_rented_before_check
  check (rented_before is null or rented_before in ('yes', 'no'));

alter table rental_leads drop constraint if exists rental_leads_deposit_ready_check;
alter table rental_leads add constraint rental_leads_deposit_ready_check
  check (deposit_ready is null or deposit_ready in ('yes', 'no', 'need-pricing'));

-- Insurance gained a third answer: "need one provided". 'unsure' is retained so
-- the constraint still validates rows captured by the previous form version.
alter table rental_leads drop constraint if exists rental_leads_has_insurance_check;
alter table rental_leads add constraint rental_leads_has_insurance_check
  check (has_insurance in ('yes', 'no', 'need-provided', 'unsure'));

-- ============================================================
-- 4. waitlist_signups
-- ============================================================
-- Deliberately separate from rental_leads: waitlist entries must NOT enter the
-- AI qualification pipeline, trigger outcome emails, or dilute lead metrics.
create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  full_name text not null,
  email text not null,
  phone text,

  -- What they're waiting on.
  reason text not null
    check (reason in ('not-ready', 'vehicle-unavailable', 'not-eligible', 'other')),
  timeframe text
    check (timeframe is null or timeframe in
      ('within-month', 'one-to-three-months', 'three-plus-months', 'unsure')),

  vehicle_id text,
  vehicle_name text,
  notes text,

  -- Set when the entry came from an already-submitted rental request.
  source_submission_id text,

  -- Owner-managed follow-up flag.
  contacted boolean not null default false
);

create index if not exists waitlist_signups_created_at_idx
  on waitlist_signups (created_at desc);
create index if not exists waitlist_signups_email_idx
  on waitlist_signups (email);

alter table waitlist_signups enable row level security;

-- Same least-privilege shape as rental_leads: public inserts, owner reads.
revoke all on waitlist_signups from anon, authenticated;
grant insert on waitlist_signups to anon, authenticated;
grant select, update on waitlist_signups to authenticated;
grant all on waitlist_signups to service_role;

drop policy if exists "public can join waitlist" on waitlist_signups;
create policy "public can join waitlist"
  on waitlist_signups for insert
  to anon, authenticated
  with check (true);

drop policy if exists "authenticated can read waitlist" on waitlist_signups;
create policy "authenticated can read waitlist"
  on waitlist_signups for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update waitlist" on waitlist_signups;
create policy "authenticated can update waitlist"
  on waitlist_signups for update
  to authenticated
  using (true)
  with check (true);
