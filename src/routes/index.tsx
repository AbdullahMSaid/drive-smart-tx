import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import { Hero } from "@/components/site/Hero";
import { SectionRibbon } from "@/components/site/SectionRibbon";
import { Fleet } from "@/components/site/Fleet";
import { PremiumUseCases } from "@/components/site/PremiumUseCases";
import { HowItWorks } from "@/components/site/HowItWorks";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { Promotions } from "@/components/site/Promotions";
import { LeadForm } from "@/components/site/LeadForm";
import { Faq } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { SiteFooter } from "@/components/site/SiteFooter";
import { scrollToId } from "@/lib/scroll";
import { usePastHero } from "@/hooks/use-past-hero";
import type { Vehicle } from "@/data/vehicles";
import {
  autoRentalSchema,
  breadcrumbSchema,
  faqSchema,
  jsonLdScript,
  websiteSchema,
} from "@/lib/structured-data";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    // Structured data lives on the landing page rather than the root so the
    // owner portal and privacy page don't claim to be the business homepage.
    // FAQPage is generated from the same array the page renders, so the markup
    // can't drift from the visible answers.
    scripts: [
      jsonLdScript(autoRentalSchema()),
      jsonLdScript(websiteSchema()),
      jsonLdScript(faqSchema()),
      jsonLdScript(breadcrumbSchema([{ name: "Home", path: "/" }])),
    ],
  }),
});

function Landing() {
  const [preselectedId, setPreselectedId] = useState<string | null>(null);
  const pastHero = usePastHero();

  const onSelectVehicle = (v: Vehicle) => {
    setPreselectedId(v.id);
    scrollToId("lead-form");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav hidden={pastHero} />
      <SectionRibbon visible={pastHero} />
      <main>
        <Hero />
        <Fleet onSelect={onSelectVehicle} />
        <PremiumUseCases />
        <HowItWorks />
        <WhyChooseUs />
        <Promotions />
        <LeadForm
          preselectedVehicleId={preselectedId}
          onPreselectHandled={() => setPreselectedId(null)}
        />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
