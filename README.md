<div align="center">

# 👑 Royalty Luxury Transportation Services

**Premium & economy vehicle rentals across the Dallas–Fort Worth metroplex.**

A polished, single-page marketing site with a multi-step lead intake form,
transparent variable pricing, and a private owner portal for managing leads.

[![Live Site](https://img.shields.io/badge/live-drive--smart--tx.lovable.app-D4AF37?style=for-the-badge)](https://drive-smart-tx.lovable.app)
[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-v1-FF4154?style=for-the-badge&logo=react&logoColor=white)](https://tanstack.com/start)
[![React 19](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## ✨ Highlights

| | |
|---|---|
| 🎬 **Cinematic hero** | Full-screen carousel with Ken Burns motion and a chip-based vehicle selector |
| 🚗 **Data-driven fleet** | Economy, Premium, and Coming Soon groups with live availability badges |
| 💵 **Transparent pricing** | `From $X/day` cards plus weekday/weekend rate breakdowns and date overrides |
| 🧮 **Rental estimator** | Day-by-day total calculated from real pickup/return dates and times |
| 📝 **Multi-step intake** | Validated 4-step lead form with deterministic qualification scoring |
| 🔐 **Owner portal** | Auth-gated `/owner` route for browsing leads and updating status |
| 📧 **Instant notifications** | New leads trigger a formatted email via Resend, non-blocking |
| 📱 **Mobile-first** | Sticky section ribbon that replaces the header — never two nav bars at once |

---

## 🎨 Design System

Charcoal and navy foundations with gold accents, driven entirely by semantic
tokens in `src/styles.css` (OKLCH color space, Fraunces + Inter typography).

```
Background   deep charcoal / navy
Accent       champagne gold
Type         Fraunces (display) · Inter (body)
```

> No hardcoded color utilities in components — every surface, border, and accent
> comes from a token so theming stays consistent.

---

## 🗂️ Project Structure

```text
src/
├── routes/                  # File-based routing (TanStack Start)
│   ├── __root.tsx           # App shell, global metadata, error boundary
│   ├── index.tsx            # The one-page marketing site
│   ├── owner.tsx            # Private lead management portal
│   └── privacy.tsx          # Privacy policy
├── components/site/         # Section + UI components
│   ├── Hero.tsx             # Cinematic carousel
│   ├── Fleet.tsx            # "Choose Your Rental"
│   ├── LeadForm.tsx         # Multi-step intake
│   ├── RentalEstimator.tsx  # Date-based total
│   └── SectionRibbon.tsx    # Sticky in-page nav
├── data/                    # vehicles · pricing · promotions · faqs
├── lib/                     # Qualification logic, email server functions
└── integrations/supabase/   # Database client
```

---

## 🚀 Getting Started

```bash
bun install
bun run dev        # http://localhost:8080
```

| Script | Purpose |
|---|---|
| `bun run dev` | Start the dev server |
| `bun run build` | Production build |
| `bun run lint` | Lint the project |
| `bun run format` | Format with Prettier |

---

## 🔧 Configuration

Copy `.env.example` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Used for |
|---|---|
| `VITE_SUPABASE_URL` | Database + auth endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser client (RLS enforced) |
| `RESEND_API_KEY` | Server-side lead notification emails |

> ⚠️ Server-only keys are read inside server function handlers — never exposed
> to the browser bundle.

---

## 🗄️ Database

SQL migrations live in `supabase/`, applied in order:

| File | Adds |
|---|---|
| `schema-v2.sql` | `rental_leads`, `qualification_results`, grants + RLS |
| `schema-v3.sql` | Intake fields: age, income source, proof of income, payment readiness |
| `owner-portal.sql` | `lead_status` column and owner-only read/update policies |

---

## 🔒 Security Notes

- Anonymous visitors can **insert** leads only — reads are owner-only via RLS.
- The owner portal requires an authenticated session; `/owner` redirects to sign-in otherwise.
- No payment processing and no customer accounts anywhere in the app.

---

## 📞 Contact

<div align="center">

**Royalty Luxury Transportation Services**
Dallas, TX 75235
[royaltylux8@gmail.com](mailto:royaltylux8@gmail.com) · [(614) 359-1370](tel:+16143591370)

*Serving the DFW area.*

</div>
