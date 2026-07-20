import { Button } from "@/components/ui/button";
import { scrollToId } from "@/lib/scroll";
import { Phone, Mail } from "lucide-react";

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
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => scrollToId("lead-form")}
                className="h-12 px-8 bg-gold text-gold-foreground hover:bg-gold/90"
              >
                Check Availability
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-8 border-gold/40 text-foreground hover:bg-accent"
              >
                <a href="tel:+16143591370">Call (614) 359-1370</a>
              </Button>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center text-sm text-muted-foreground">
              <a href="tel:+16143591370" className="inline-flex items-center gap-2 hover:text-gold">
                <Phone className="h-4 w-4 text-gold" /> (614) 359-1370
              </a>
              <a href="mailto:royaltylux8@gmail.com" className="inline-flex items-center gap-2 hover:text-gold">
                <Mail className="h-4 w-4 text-gold" /> royaltylux8@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
