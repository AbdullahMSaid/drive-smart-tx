## Goal
Give the business owner a discreet way to reach the private portal at `/owner` without advertising it to visitors.

## What changes
- **`src/components/site/SiteFooter.tsx`**: add a small, muted "Owner Login" link in the footer's bottom legal row, next to the existing Privacy Policy / Rental Agreement links.
  - Styled at the same small size as the legal links, but in the lowest-contrast muted tone so it reads as utility text, not a call to action.
  - Uses TanStack `<Link to="/owner">` so navigation stays client-side.
  - Marked `rel="nofollow"` so search engines don't index the portal path.

## What does not change
- No change to the public site layout, hero, fleet, form, or branding.
- No change to `/owner` itself, auth, or Supabase policies.
- No nav/header entry — the link exists only in the footer.

## Technical notes
The portal route already redirects to its login screen when there's no session, so the link is safe to expose: an anonymous visitor who clicks it just sees a sign-in form and RLS still blocks any lead data.

## How to verify
Scroll to the footer on the homepage, click "Owner Login", confirm it lands on the portal sign-in screen, and that signing in still shows the lead list.
