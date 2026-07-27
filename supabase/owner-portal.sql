-- Owner Portal — run this in Supabase → SQL Editor.
-- Adds an owner-managed status column and RLS policies so ONLY authenticated
-- users can read/update leads. The existing public (anon) insert policy for the
-- intake form is left untouched.

-- 1. Owner-facing status column (separate from the internal processing_status)
alter table rental_leads
  add column if not exists lead_status text not null default 'new'
  check (lead_status in ('new', 'contacted', 'qualified', 'reserved', 'completed', 'lost'));

-- 2. Data API grants
grant insert on rental_leads to anon;                 -- public intake form (unchanged)
grant select, update on rental_leads to authenticated; -- owner portal

-- 3. RLS policies for the owner (any authenticated user)
drop policy if exists "authenticated can read leads" on rental_leads;
create policy "authenticated can read leads"
  on rental_leads for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update leads" on rental_leads;
create policy "authenticated can update leads"
  on rental_leads for update
  to authenticated
  using (true)
  with check (true);

-- Note: no anon SELECT/UPDATE/DELETE policy exists, so anonymous visitors can
-- still only INSERT via the public form and can never read lead data.
