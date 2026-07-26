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

export const Route = createFileRoute("/")({
  component: Landing,
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
