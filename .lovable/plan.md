## Why the lead isn't showing

The portal query is fine — the database is blocking it silently. `rental_leads` has RLS enabled with only a public INSERT policy (from schema v2). With RLS on and no SELECT policy for signed-in users, Postgres returns **zero rows and no error**, which the portal renders as "No leads yet." That matches exactly what you're seeing, and it's expected because `supabase/owner-portal.sql` hasn't been run yet.

## Fix (you run one SQL script)

Open Supabase → SQL Editor and run the existing file `supabase/owner-portal.sql`. It does three things:

1. Adds the `lead_status` column (default `new`, constrained to new/contacted/qualified/reserved/completed/lost) — the portal's status dropdown depends on it.
2. Grants Data API access: `insert` to `anon` (your public form, unchanged) and `select, update` to `authenticated` (the owner).
3. Creates the two RLS policies: `authenticated can read leads` and `authenticated can update leads`.

Your public intake form keeps working — nothing in the script touches the anon insert policy.

After running it, reload `/owner` and hit the refresh icon; the test lead should appear.

## Code change I'd make alongside it

Right now a blocked-by-RLS read and a genuinely empty table look identical. In `src/routes/owner.tsx` I'd:

- Distinguish the two states: if the query returns 0 rows **and** a follow-up `count` check errors, or the error is a permission error, show a specific message ("Owner access isn't configured yet — run supabase/owner-portal.sql") instead of "No leads yet."
- Surface any Postgres error code/hint in the existing red alert box, so future permission issues are self-explaining rather than looking like empty data.

No other files change; styling and the intake form are untouched.

### Technical notes

- Empty-vs-denied is indistinguishable on plain SELECT under RLS; the reliable signal is a `select('*', { count: 'exact', head: true })` probe, which errors on a missing grant but returns 0 on a genuine empty table.
- If the script's `lead_status` step errors because the column already exists with a different constraint, that line is safely re-runnable via `add column if not exists`.
