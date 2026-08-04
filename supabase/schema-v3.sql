-- Drive Smart TX — schema v3
-- Adds the new intake questions: exact age, income source, proof of income,
-- first week's payment, additional driver, and rental-agreement acceptance.
-- Run in Supabase → SQL Editor. Safe to re-run.

alter table rental_leads
  add column if not exists age int,
  add column if not exists income_source text,
  add column if not exists proof_of_income text,
  add column if not exists first_week_payment text,
  add column if not exists additional_driver text,
  add column if not exists agrees_to_agreement text;

-- Constraints (dropped first so the script is idempotent)
alter table rental_leads drop constraint if exists rental_leads_age_check;
alter table rental_leads add constraint rental_leads_age_check
  check (age is null or (age between 15 and 100));

alter table rental_leads drop constraint if exists rental_leads_income_source_check;
alter table rental_leads add constraint rental_leads_income_source_check
  check (income_source is null or income_source in ('employed', 'self-employed', 'uber', 'lyft', 'other'));

alter table rental_leads drop constraint if exists rental_leads_proof_of_income_check;
alter table rental_leads add constraint rental_leads_proof_of_income_check
  check (proof_of_income is null or proof_of_income in ('yes', 'no'));

alter table rental_leads drop constraint if exists rental_leads_first_week_payment_check;
alter table rental_leads add constraint rental_leads_first_week_payment_check
  check (first_week_payment is null or first_week_payment in ('yes', 'no'));

alter table rental_leads drop constraint if exists rental_leads_additional_driver_check;
alter table rental_leads add constraint rental_leads_additional_driver_check
  check (additional_driver is null or additional_driver in ('yes', 'no'));

alter table rental_leads drop constraint if exists rental_leads_agrees_to_agreement_check;
alter table rental_leads add constraint rental_leads_agrees_to_agreement_check
  check (agrees_to_agreement is null or agrees_to_agreement in ('yes', 'no'));

-- meets_age is still written by the app (derived from the exact age) so the
-- existing not-null check on that column keeps working.
