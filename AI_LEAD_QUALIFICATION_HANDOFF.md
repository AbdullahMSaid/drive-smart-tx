# AI Lead Qualification — Resume Handoff

## Current State

The application is ready for a local client demo. The intake form saves raw submissions to Supabase, immediately shows the visitor a confirmation screen, sends the raw intake email, and starts the AI review without making the visitor wait for the model.

The deterministic engine uses the owner's confirmed minimum age of 25 and remains authoritative for eligibility, hard rejections, scores, missing information, and manual-review rules.

The AI layer uses LangChain with OpenRouter model `deepseek/deepseek-v4-flash`. It returns function-calling structured output, validates it with Zod, adds an owner summary and recommended action, and cannot override deterministic hard rejections.

The authenticated `/owner` portal includes the dashboard, lead list, raw intake detail, deterministic result, visibly gold-labeled **AI Summary**, and **AI Recommended Action**.

## Current Demo Flow

```text
Visitor submits intake
→ raw lead saved to rental_leads
→ visitor immediately sees confirmation
→ raw intake email goes to the project owner's verified inbox
→ server reloads the saved lead and recomputes deterministic rules
→ one structured OpenRouter review runs
→ protected final result and audit events are saved
→ AI result appears in the owner portal
→ outcome email preview goes to the project owner's verified inbox
```

## Demo Email Mode

Email delivery is intentionally locked to the project owner's verified Resend inbox, regardless of the email entered in the form.

- Raw intake email: owner inbox.
- Passed, not-eligible, or more-information outcome preview: owner inbox.
- The submitted customer address appears in the preview subject for demonstration.
- No form-entered customer receives email in demo mode.
- `onboarding@resend.dev` remains the sender until a domain is verified.

After client approval and domain verification, update `sendQualificationEmailViaResend` in `src/lib/lead-email.server.ts` to use `FROM_EMAIL` and `payload.customerEmail`. Then remove the temporary raw-intake email after the owner confirms the final email is sufficient.

## Completed Work

- Exported Lovable image assets into tracked local files.
- Built and tested the deterministic qualification engine.
- Built the authenticated owner dashboard and lead-detail experience.
- Corrected hard-rejection presentation so a score cannot imply approval.
- Added LangChain/OpenRouter structured AI review with Zod validation.
- Added a pure guard preventing AI from bypassing hard rejections.
- Added safe manual-review fallback when AI is unavailable.
- Added server-only Supabase processing and audit writes.
- Applied `supabase/schema-v5.sql` to the connected Supabase project.
- Corrected intake RLS so anonymous visitors and authenticated owners can submit.
- Added three customer outcome email templates: passed, not eligible, and more information.
- Changed the form to show confirmation immediately while AI continues.
- Tested 10 synthetic candidates: all 10 matched expected final outcomes.
- Sent and verified all three customer email previews through Resend.
- Protected `.env` through `.gitignore`; it is not tracked.

## Configuration

Configured locally in ignored `.env`:

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=deepseek/deepseek-v4-flash
RESEND_API_KEY=...
```

Never commit `.env`, expose the service-role key through a `VITE_` variable, or paste secret values into project files.

The same server-only values must be added separately to Lovable Cloud secrets before the hosted preview can run the AI and email pipeline. After adding them, republish and complete one hosted end-to-end test. Until then, local is the verified demo environment.

## Test Matrix Result

| Case | Deterministic result | Protected final result |
| --- | --- | --- |
| Excellent candidate | High priority | High |
| Under age 25 | Not eligible | Not eligible |
| No valid license | Not eligible | Not eligible |
| Suspended license | Not eligible | Not eligible |
| No income proof | Not eligible | Not eligible |
| Cannot pay first week | Not eligible | Not eligible |
| Cannot pay deposit | Not eligible | Not eligible |
| Insurance uncertain | Needs review | Manual review |
| Additional driver | Needs review | Manual review |
| Contradictory notes | Needs review | Manual review |

Synthetic records are labeled `TEST AI MATRIX` in the owner portal.

## Verification Last Run

- `bun run test` — 41 tests passed.
- `bun run build` — passed.
- Targeted ESLint for changed TypeScript/TSX files — passed.
- `git diff --check` — passed.
- Live OpenRouter structured call — passed.
- Live Resend previews for all three outcomes — passed.

The remaining build warning is from the pre-existing email server function using TanStack's deprecated `inputValidator` API.

## Exact Next Steps

1. Add all server-only secrets to Lovable Cloud.
2. Republish the Lovable preview.
3. Submit one complete request on the hosted URL.
4. Confirm immediate visitor feedback, both owner-inbox emails, Supabase records, and owner portal AI output.
5. Use the hosted URL for the client demo only after that test passes; keep local as backup.
6. After client approval, verify the sending domain and enable real customer delivery.
7. Remove the raw-intake email when the owner approves the final outcome email.
8. Complete rate limits, duplicate prevention, input hardening, CSRF protection, and cost guardrails before public launch.

## Relevant Files

- `src/lib/qualification/engine.ts` — deterministic business rules.
- `src/lib/qualification/ai-review.ts` — AI schema, prompt, fallback, and decision guard.
- `src/lib/qualification/ai-review.server.ts` — LangChain/OpenRouter call.
- `src/lib/qualification/process-lead.server.ts` — server pipeline, persistence, emails, and audit events.
- `src/lib/qualification/process-lead.functions.ts` — browser/server boundary.
- `src/lib/lead-qualification.ts` — raw persistence and pipeline trigger.
- `src/lib/lead-email.server.ts` — raw and outcome email rendering/delivery.
- `src/components/site/LeadForm.tsx` — form submission and immediate confirmation.
- `src/routes/owner.tsx` — owner dashboard and AI-labeled lead detail.
- `supabase/schema-v5.sql` — AI fields, processing events, status constraints, and intake policy.
