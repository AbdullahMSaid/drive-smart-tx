import { vehicles, type Vehicle } from "@/data/vehicles";
import { VehicleCard } from "./VehicleCard";
import { SectionHeading } from "./SectionHeading";
import { Categories } from "./Categories";

export function Fleet({ onSelect }: { onSelect: (v: Vehicle) => void }) {
  const economy = vehicles.filter((v) => v.category === "economy");
  const premium = vehicles.filter((v) => v.category === "premium");
  const comingSoon = vehicles.filter((v) => v.category === "coming-soon");

  return (
    <section id="fleet" className="section-y scroll-mt-32 bg-background">
      <div className="container-x">
        <SectionHeading
          eyebrow="Featured fleet"
          title="Choose Your Rental"
          subtitle="Our carefully maintained fleet includes reliable economy vehicles, premium luxury sedans, and spacious SUVs for every occasion."
        />

        <Categories />

        <FleetGroup
          id="fleet-economy"
          title="Economy Vehicles"
          count={economy.length}
          items={economy}
          onSelect={onSelect}
        />

        <FleetGroup
          id="fleet-premium"
          title="Premium Vehicles"
          count={premium.length}
          items={premium}
          onSelect={onSelect}
        />

        {comingSoon.length > 0 && (
          <FleetGroup
            id="fleet-coming-soon"
            title="Coming Soon"
            count={comingSoon.length}
            items={comingSoon}
            onSelect={onSelect}
          />
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
          Vehicle availability, pricing, eligibility, and final rental terms must be confirmed by the rental provider.
        </p>
      </div>
    </section>
  );
}

function FleetGroup({
  id,
  title,
  count,
  items,
  onSelect,
}: {
  id: string;
  title: string;
  count: number;
  items: Vehicle[];
  onSelect: (v: Vehicle) => void;
}) {
  return (
    <div id={id} className="mt-12 scroll-mt-32">
      <div className="mb-6 flex items-baseline justify-between border-b border-border pb-3">
        <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {count} vehicle{count === 1 ? "" : "s"}
        </span>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((v) => (
          <VehicleCard key={v.id} vehicle={v} onCheckAvailability={onSelect} />
        ))}
      </div>
    </div>
  );
}
