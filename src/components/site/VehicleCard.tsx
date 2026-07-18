import { Users, Cog, Fuel, Luggage } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/data/vehicles";

export function VehicleCard({
  vehicle,
  onCheckAvailability,
}: {
  vehicle: Vehicle;
  onCheckAvailability: (v: Vehicle) => void;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-gold/50 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          width={1200}
          height={800}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-background/80 backdrop-blur px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-foreground">
            {vehicle.categoryLabel}
          </span>
          {vehicle.promoLabel && (
            <span className="rounded-full bg-gold text-gold-foreground px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
              {vehicle.promoLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-card-foreground">
          {vehicle.name}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {vehicle.description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Spec icon={Users} label={`${vehicle.passengers} passengers`} />
          <Spec icon={Cog} label={vehicle.transmission} />
          <Spec icon={Fuel} label={vehicle.fuel} />
          <Spec icon={Luggage} label={vehicle.luggage} />
        </div>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {vehicle.features.slice(0, 3).map((f) => (
            <li
              key={f}
              className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
            >
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Starting at
            </div>
            <div className="mt-1 font-display text-xl font-semibold text-gold">
              {vehicle.dailyPrice}
            </div>
            <div className="text-xs text-muted-foreground">
              or {vehicle.weeklyPrice}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>{vehicle.availabilityLabel}</div>
            <div className="mt-1">Min. {vehicle.minRentalDays} day{vehicle.minRentalDays > 1 ? "s" : ""}</div>
          </div>
        </div>

        <Button
          onClick={() => onCheckAvailability(vehicle)}
          className="mt-5 bg-gold text-gold-foreground hover:bg-gold/90"
        >
          Check Availability
        </Button>
      </div>
    </article>
  );
}

function Spec({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 text-card-foreground/85">
      <Icon className="h-4 w-4 text-gold shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}
