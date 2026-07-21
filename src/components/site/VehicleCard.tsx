import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, type Vehicle } from "@/data/vehicles";
import { cn } from "@/lib/utils";

export function VehicleCard({
  vehicle,
  onCheckAvailability,
}: {
  vehicle: Vehicle;
  onCheckAvailability: (v: Vehicle) => void;
}) {
  const isComingSoon = vehicle.category === "coming-soon" || vehicle.status === "coming-soon";
  const priceLine = vehicle.priceLine ?? "Call for Pricing";
  const priceSubline =
    vehicle.priceSubline ?? (isComingSoon ? "Waitlist open" : "Daily & Weekly Rates Available");
  const buttonLabel = vehicle.waitlist ? "Join Waitlist" : "Request This Vehicle";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-gold/50 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]",
        isComingSoon && "opacity-80 hover:opacity-95",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          width={1200}
          height={800}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
            isComingSoon && "grayscale-[35%]",
          )}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-background/80 backdrop-blur px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-foreground">
            {vehicle.categoryLabel}
          </span>
          {vehicle.promoLabel && (
            <span className="rounded-full bg-gold text-gold-foreground px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
              {vehicle.promoLabel}
            </span>
          )}
        </div>
        {isComingSoon && (
          <div className="pointer-events-none absolute -right-12 top-6 rotate-45 bg-gold text-gold-foreground px-14 py-1 text-[11px] font-semibold uppercase tracking-widest shadow-md">
            Coming Soon
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div>
          <h3 className="font-display text-xl font-semibold text-card-foreground">
            {vehicle.name}
          </h3>
          <p className="text-xs uppercase tracking-wider text-gold/90 mt-0.5">
            {vehicle.subtitle}
          </p>
        </div>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {vehicle.description}
        </p>

        {vehicle.highlights.length > 0 && (
          <ul className="mt-5 grid grid-cols-2 gap-2 text-sm">
            {vehicle.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-card-foreground/90">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {vehicle.idealFor.length > 0 && (
          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-gold" /> Ideal For
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {vehicle.idealFor.map((t) => (
                <li
                  key={t}
                  className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Pricing
            </div>
            <div className="mt-1 font-display text-xl font-semibold text-gold">
              {priceLine}
            </div>
            <div className="text-xs text-muted-foreground">{priceSubline}</div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>{STATUS_LABELS[vehicle.status]}</div>
            <div className="mt-1">
              Min. {vehicle.minRentalDays} day{vehicle.minRentalDays > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <Button
          onClick={() => onCheckAvailability(vehicle)}
          className="mt-5 bg-gold text-gold-foreground hover:bg-gold/90"
        >
          {buttonLabel}
        </Button>
      </div>
    </article>
  );
}
