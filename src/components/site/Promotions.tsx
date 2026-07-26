import { promotions } from "@/data/promotions";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";
import { scrollToId } from "@/lib/scroll";
import { Tag } from "lucide-react";

export function Promotions() {
  return (
    <section id="promotions" className="section-y scroll-mt-32">
      <span id="pricing" className="block scroll-mt-32" aria-hidden="true" />
      <div className="container-x">
        <SectionHeading
          eyebrow="Promotions"
          title="Seasonal offers and rental packages."
          subtitle="Ask about current promotions when submitting your rental request."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {promotions.map((p) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition hover:border-gold/50"
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/10 blur-2xl transition group-hover:bg-gold/20" />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gold">
                  <Tag className="h-3 w-3" />
                  {p.tag}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-card-foreground">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                <Button
                  onClick={() => scrollToId("lead-form")}
                  variant="outline"
                  className="mt-6 border-gold/40 hover:bg-gold hover:text-gold-foreground hover:border-gold"
                >
                  Check Availability
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
