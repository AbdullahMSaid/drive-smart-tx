import { Button } from "@/components/ui/button";
import { scrollToId } from "@/lib/scroll";

export function FinalCta() {
  return (
    <section className="section-y">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-card via-card to-background p-10 md:p-16 text-center">
          <div className="absolute -top-24 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground">
              Ready to find the <span className="gold-gradient-text">right rental?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Tell us what you need and when you need it. Our Lead Qualification AI will organize your request
              so the rental team can respond with availability and next steps.
            </p>
            <Button
              size="lg"
              onClick={() => scrollToId("lead-form")}
              className="mt-8 h-12 px-8 bg-gold text-gold-foreground hover:bg-gold/90"
            >
              Check Availability
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
