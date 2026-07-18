import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";
import { scrollToId } from "@/lib/scroll";
import { Car, Sparkles, Check } from "lucide-react";

const cats = [
  {
    id: "economy",
    icon: Car,
    title: "Economy Vehicles",
    body: "Practical, comfortable, and cost-conscious vehicles for everyday transportation, commuting, delivery work, and extended rentals.",
    benefits: ["Affordable rental options", "Fuel-efficient vehicles", "Flexible rental inquiries"],
    target: "fleet-economy",
    cta: "View Economy Vehicles",
  },
  {
    id: "premium-suv",
    icon: Sparkles,
    title: "Premium SUVs",
    body: "Spacious premium SUVs designed for families, groups, airport transportation, road trips, business travel, and special occasions.",
    benefits: ["Spacious passenger seating", "Premium comfort", "Ideal for group and long-distance travel"],
    target: "fleet-premium",
    cta: "View Premium SUVs",
  },
];

export function Categories() {
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading
          eyebrow="Two ways to travel"
          title="One fleet built for every kind of trip."
          subtitle="From fuel-efficient daily drivers to full-size premium SUVs — choose the vehicle that fits the moment."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {cats.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-gold/50"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-gold/15 text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-card-foreground">
                    {c.title}
                  </h3>
                </div>
                <p className="mt-4 text-muted-foreground leading-relaxed">{c.body}</p>
                <ul className="mt-6 space-y-2">
                  {c.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-card-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => scrollToId(c.target)}
                  variant="outline"
                  className="mt-8 border-gold/40 text-foreground hover:bg-gold hover:text-gold-foreground hover:border-gold"
                >
                  {c.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
