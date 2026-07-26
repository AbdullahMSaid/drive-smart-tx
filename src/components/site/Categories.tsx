import { Button } from "@/components/ui/button";
import { scrollToId } from "@/lib/scroll";
import { Car, Sparkles } from "lucide-react";

const cats = [
  {
    id: "economy",
    icon: Car,
    title: "Economy Vehicles",
    body: "Practical, fuel-efficient vehicles for commuting, delivery work, and extended rentals.",
    target: "fleet-economy",
    cta: "View Economy Vehicles",
  },
  {
    id: "premium-suv",
    icon: Sparkles,
    title: "Premium SUVs",
    body: "Spacious SUVs for families, airport transportation, road trips, and special occasions.",
    target: "fleet-premium",
    cta: "View Premium SUVs",
  },
];

export function Categories() {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2">
      {cats.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-gold/50"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-xl font-semibold text-card-foreground">
                {c.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              <Button
                onClick={() => scrollToId(c.target)}
                variant="outline"
                size="sm"
                className="mt-4 border-gold/40 text-foreground hover:bg-gold hover:text-gold-foreground hover:border-gold"
              >
                {c.cta}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
