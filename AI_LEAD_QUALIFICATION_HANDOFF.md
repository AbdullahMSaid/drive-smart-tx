# AI Lead Qualification — Resume Handoff

## Current State

The rental intake form works locally against the connected Supabase project and
sends the temporary raw-intake Resend email. The owner portal at `/owner` is
authenticated and now includes a dashboard plus lead/detail views.

The deterministic qualification engine is complete and tested. It applies the
owner's confirmed 25-year minimum age, protected hard-rejection rules,
manual-review rules, scoring, flags, missing information, and a recommended
action. Qualification results are stored in `qualification_results` and shown
alongside raw lead data in the owner portal.

## Completed Work

- Exported Lovable-only image assets into tracked local PNG files.
- Added deterministic qualification engine at `src/lib/qualification/engine.ts`.
- Added 32 Vitest cases at `src/lib/qualification/engine.test.ts`.
- Added `supabase/schema-v4.sql` for qualification/pipeline support.
- Updated `/owner` with:
  - Dashboard KPIs based on real leads and qualification results.
  - Recent-lead activity and a manual-review queue.
  - Lead detail view with raw intake and qualification result.
  - Clear hard-rejection presentation: a rule score cannot be mistaken for
    approval when an eligibility rule failed.
- Added local `.env` protection to `.gitignore`; `.env` is not tracked.
- Regenerated `src/routeTree.gen.ts` after the TanStack Start build.

## Current Qualification Flow

```text
Browser form
→ insert raw lead into rental_leads
→ send temporary raw-intake Resend email
→ run deterministic qualification in the browser
→ insert result into qualification_results
→ owner portal reads lead + result
```

The temporary raw-intake email is intentionally retained for now so the owner
can compare the submitted answers with future AI output. Do not remove it until
the owner validates the final qualification-summary email.

## Configuration Needed Before AI Work

Local `.env` must contain real values for these server-only settings. Do not
commit the file or paste the values into chat.

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=...
```

`SUPABASE_URL` should match `VITE_SUPABASE_URL`. The service-role value is the
Supabase secret key (`sb_secret_...`), never a `VITE_` variable. At handoff,
these four values had not yet been configured. `RESEND_API_KEY` is configured.

## Exact Next Step: Structured AI Review

Implement one server-side LangChain/OpenRouter structured call after the
deterministic result is created. It must receive normalized lead data, the
protected deterministic result, and relevant notes. Validate the output with
Zod.

Required AI fields:

- `priority`: `high | normal | low | manual_review`
- concise owner summary
- evidence-based additional risk flags
- contradictions/inconsistencies
- missing information
- recommended owner action
- suggested customer reply

Rules:

- The model cannot override a deterministic hard rejection.
- It can only downgrade a non-rejected lead to manual review when supported by
  the submission.
- It must not invent facts, infer protected traits, or claim fraud without
  objective evidence.
- AI failure must preserve the raw lead and deterministic result, then route to
  manual review with an audit event.

## Intended Production Flow

```text
Save raw lead
→ temporary raw-intake email (during validation period)
→ deterministic result
→ one server-side structured AI review
→ protected final decision + audit event
→ save AI metadata/output
→ final qualification-summary email
```

After owner validation, remove the temporary raw-intake email and retain only
the final qualification-summary email.

## Verification Last Run

- `bun run test` — 32 tests passed.
- `bun run build` — passed.
- `bunx eslint src/routes/owner.tsx` — passed.

The full-project lint command still fails because of pre-existing formatting
violations outside the owner route. It was not mass-formatted in this work.

## Relevant Files

- `src/lib/qualification/engine.ts` — pure rental qualification rules.
- `src/lib/lead-qualification.ts` — browser persistence seam.
- `src/components/site/LeadForm.tsx` — form submission flow and raw email call.
- `src/lib/lead-email.functions.ts` / `src/lib/lead-email.server.ts` — current
  server-side Resend integration.
- `src/routes/owner.tsx` — owner dashboard, lead list, and review detail.
- `supabase/schema-v4.sql` — current qualification-related schema migration.
