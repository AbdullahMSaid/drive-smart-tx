import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DOW_LABELS, formatCurrency, type VehiclePricing } from "@/data/pricing";

const ORDER: (keyof VehiclePricing["standardRates"])[] = [
  "mon", "tue", "wed", "thu", "fri", "sat", "sun",
];

export function RateDetailsDialog({
  trigger,
  pricing,
  vehicleName,
}: {
  trigger: ReactNode;
  pricing: VehiclePricing;
  vehicleName: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="font-display text-xl">
            {vehicleName} — Daily Rates
          </DialogTitle>
          <DialogDescription>
            Rates vary by day of week. Estimates are subject to availability and final confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {ORDER.map((k) => (
                  <tr key={k} className="grid grid-cols-2 gap-3 px-4 py-2.5">
                    <td className="text-muted-foreground">{DOW_LABELS[k]}</td>
                    <td className="text-right font-medium text-foreground">
                      {formatCurrency(pricing.standardRates[k])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pricing.pricingNotes && pricing.pricingNotes.length > 0 && (
            <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
              {pricing.pricingNotes.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Estimates exclude applicable taxes, refundable security deposit, delivery,
            mileage overages, optional services, and other disclosed fees. Special-event
            pricing may apply on specific dates.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
