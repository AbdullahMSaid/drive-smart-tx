import { vehicles, type Vehicle } from "@/data/vehicles";
import { VehicleCard } from "./VehicleCard";
import { SectionHeading } from "./SectionHeading";

export function Fleet({ onSelect }: { onSelect: (v: Vehicle) => void }) {
  const economy = vehicles.filter((v) => v.category === "economy");
  const premium = vehicles.filter((v) => v.category === "premium-suv");

  return (
    <section id="fleet" className="section-y bg-background">
      <div className="container-x">
        <SectionHeading
          eyebrow="Featured fleet"
          title="Vehicles ready for the road."
          subtitle="A curated fleet of economy cars and premium SUVs. Tell us which one fits your trip and the rental team will confirm availability."
        />

        <div id="fleet-economy" className="mt-14 scroll-mt-24">
          <div className="mb-6 flex items-baseline justify-between border-b border-border pb-3">
            <h3 className="font-display text-2xl font-semibold text-foreground">Economy Vehicles</h3>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {economy.length} vehicles
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {economy.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onCheckAvailability={onSelect} />
            ))}
          </div>
        </div>

        <div id="fleet-premium" className="mt-16 scroll-mt-24">
          <div className="mb-6 flex items-baseline justify-between border-b border-border pb-3">
            <h3 className="font-display text-2xl font-semibold text-foreground">Premium SUVs</h3>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {premium.length} vehicles
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {premium.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onCheckAvailability={onSelect} />
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
          Vehicle availability, pricing, eligibility, and final rental terms must be confirmed by the rental provider.
        </p>
      </div>
    </section>
  );
}
