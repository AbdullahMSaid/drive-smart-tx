import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Royalty Luxury Transportation Services" },
      {
        name: "description",
        content:
          "How Royalty Luxury Transportation Services collects, uses, and protects your information.",
      },
      { property: "og:title", content: "Privacy Policy — Royalty Luxury Transportation Services" },
      {
        property: "og:description",
        content:
          "How Royalty Luxury Transportation Services collects, uses, and protects your information.",
      },
      { property: "og:url", content: "https://drive-smart-tx.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://drive-smart-tx.lovable.app/privacy" }],
  }),
});

const LAST_UPDATED = "July 20, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="section-y">
        <div className="container-x max-w-3xl">
          <p className="text-xs uppercase tracking-wider text-gold">Legal</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-foreground sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            Royalty Luxury Transportation Services ("we," "us," or "our") respects your privacy.
            This Privacy Policy explains what information we collect, how we use it, and the choices
            you have. By using this website or submitting an inquiry, you agree to this policy.
          </p>

          <Section title="1. Information We Collect">
            <p>We may collect the following information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Rental inquiry information</li>
              <li>Vehicle preferences</li>
              <li>Pickup and return dates</li>
              <li>Information voluntarily submitted through forms</li>
              <li>Device and browser information</li>
              <li>Website analytics information</li>
            </ul>
          </Section>

          <Section title="2. How We Use Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Respond to inquiries</li>
              <li>Evaluate rental requests</li>
              <li>Contact customers</li>
              <li>Improve our services</li>
              <li>Process rental request submissions</li>
              <li>Improve website performance</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="3. AI-Assisted Processing">
            <p>
              Information you submit may be processed by AI systems solely to organize rental
              inquiries, summarize submitted information, identify missing information, and help
              our team respond more efficiently.
            </p>
            <p>
              AI does not make final rental approval decisions. A member of our team reviews every
              inquiry before confirming eligibility, pricing, or availability.
            </p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>
              To operate this website and our business, we may rely on trusted third-party
              providers, including hosting providers, analytics providers, email services, AI
              providers, scheduling platforms, and cloud infrastructure. These providers only
              receive the information needed to perform their service.
            </p>
          </Section>

          <Section title="5. Cookies">
            <p>Cookies may be used to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Remember preferences</li>
              <li>Improve performance</li>
              <li>Measure website traffic</li>
            </ul>
            <p>You may disable cookies at any time through your browser settings.</p>
          </Section>

          <Section title="6. Information Sharing">
            <p>
              We never sell your personal information. Information may be shared only with trusted
              service providers necessary to operate the website, or when required by law.
            </p>
          </Section>

          <Section title="7. Data Security">
            <p>
              We use reasonable technical and administrative safeguards to protect information you
              submit. However, no online system can guarantee absolute security.
            </p>
          </Section>

          <Section title="8. Data Retention">
            <p>
              We retain submitted information only as long as reasonably necessary for business
              operations, legal obligations, or ongoing customer service.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p>
              You may request access to, correction of, or deletion of your personal information by
              contacting us using the details below.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              This website is not intended for children under 13. We do not knowingly collect
              information from children under 13.
            </p>
          </Section>

          <Section title="11. Changes">
            <p>
              We may update this Privacy Policy periodically. The "Last updated" date at the top of
              this page will reflect any changes.
            </p>
          </Section>

          <Section title="12. Contact">
            <ul className="space-y-1">
              <li><span className="text-foreground">Business Name:</span> Royalty Luxury Transportation Services</li>
              <li>
                <span className="text-foreground">Email:</span>{" "}
                <a href="mailto:royaltylux8@gmail.com" className="text-gold hover:underline">
                  royaltylux8@gmail.com
                </a>
              </li>
              <li>
                <span className="text-foreground">Phone:</span>{" "}
                <a href="tel:+16143591370" className="text-gold hover:underline">
                  (614) 359-1370
                </a>
              </li>
              <li><span className="text-foreground">Business Address:</span> Serving the greater Dallas area, Texas</li>
            </ul>
          </Section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
