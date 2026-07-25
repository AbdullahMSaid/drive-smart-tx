import { AlertCircle, Sparkles } from "lucide-react";
import { estimateRental, formatCurrency, getVehiclePricing } from "@/data/pricing";
import { cn } from "@/lib/utils";

interface Props {
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
}

export function RentalEstimator({ vehicleId, pickupDate, returnDate }: Props) {
  const pricing = vehicleId ? getVehiclePricing(vehicleId) : null;

  if (!vehicleId || !pricing) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
        Select a specific vehicle and choose your dates to see an estimated rental price.
      </div>
    );
  }

  if (!pickupDate || !returnDate) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
        Choose your pickup and return dates to see an estimated rental price for the{" "}
        <span className="text-foreground font-medium">{pricing.displayName}</span>.
      </div>
    );
  }

  const est = estimateRental(vehicleId, pickupDate, returnDate);
  if (!est) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground flex items-start gap-2">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>Return date must be on or after pickup date.</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-card via-card to-background overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <div className="text-[11px] uppercase tracking-[0.18em] text-gold font-medium">
            Estimated rental price
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {est.totalDays} day{est.totalDays === 1 ? "" : "s"}
        </div>
      </div>

      <div className="max-h-56 overflow-y-auto divide-y divide-border/60">
        {est.days.map((d) => (
          <div
            key={d.date}
            className="flex items-center justify-between px-4 py-2 text-sm"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-foreground">{d.dayLabel}</span>
              <span className="text-xs text-muted-foreground">{d.date}</span>
              {d.isOverride && (
                <span className="rounded-sm bg-gold/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-gold">
                  Event rate
                </span>
              )}
            </div>
            <span className="text-foreground">{formatCurrency(d.rate)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Estimated base rental</span>
        <span className="font-display text-2xl font-semibold text-gold">
          {formatCurrency(est.baseTotal)}
        </span>
      </div>

      {!est.meetsMinimum && (
        <div className={cn(
          "border-t border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive-foreground flex items-start gap-2",
        )}>
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            This vehicle requires a minimum {est.minimumDays}-day rental. Please extend
            your return date to continue.
          </span>
        </div>
      )}

      <p className="px-4 py-3 border-t border-border text-[11px] leading-relaxed text-muted-foreground">
        Estimate only. Excludes applicable taxes, refundable security deposit,
        delivery, mileage overages, optional services, and other disclosed fees.
        Availability and final pricing are subject to confirmation by the rental team.
      </p>
    </div>
  );
}
