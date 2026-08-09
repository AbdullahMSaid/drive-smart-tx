import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RentalPolicyDialog({ trigger }: { trigger: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="font-display text-xl">
            Private Car Rental Agreement
          </DialogTitle>
          <DialogDescription>
            Royalty Luxury Transportation Services — sample rental agreement.
            Final terms are confirmed in writing at pickup.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 py-5">
          <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed text-muted-foreground space-y-6">
            <div>
              <p className="text-foreground font-medium">Lessor: Harry Obuobisa</p>
              <p className="text-foreground font-medium">Lessee: (Renter name)</p>
            </div>

            <section>
              <h3 className="text-foreground font-display text-base font-semibold">
                1. Vehicle Information
              </h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Make/Model: 2023 Chevy Suburban</li>
                <li>VIN: 1GNSCCKD0PR465263</li>
                <li>License Plate: XMC9171</li>
                <li>Pickup / Drop-off Location: Dallas, TX 75235</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-display text-base font-semibold">
                2. Payment Structure
              </h3>
              <p className="mt-2 text-foreground font-medium">2.1 Initial Payment</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>$250 deposit due at pickup (non-refundable if contract is violated).</li>
              </ul>
              <p className="mt-3 text-foreground font-medium">2.2 Weekly Payments</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>$750 weekly payments EVERY Tuesday.</li>
              </ul>
              <p className="mt-3 text-foreground font-medium">2.3 Payment Rules</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Accepted payments: Zelle (845-381-3746)</li>
                <li>Payments are due every 7 days (every Tuesday before 12am)</li>
                <li>Late fee: $25 per day</li>
                <li>Late payments may result in termination and repossession (24 hrs)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-display text-base font-semibold">
                4. Maintenance Responsibilities
              </h3>
              <p className="mt-2 text-foreground font-medium">Lessor (Owner) covers heavy mechanical repairs, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Engine issues</li>
                <li>Transmission issues</li>
                <li>Brake system failures (not including worn brake pads from normal use)</li>
                <li>Major electrical failures</li>
              </ul>
              <p className="mt-3">
                Failure to complete required maintenance may result in penalties and loss of deposit.
              </p>
              <p className="mt-3 text-foreground font-medium">Lessee is responsible for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Oil changes every 5,000 miles</li>
                <li>Tires and tire repairs</li>
                <li>Tolls, tickets, and road usage fees</li>
                <li>Routine maintenance (monthly)</li>
                <li>Keeping insurance information in the vehicle</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-display text-base font-semibold">
                5. Mileage Restrictions
              </h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Maximum allowed mileage: Unlimited</li>
                <li>No out-of-state travel</li>
                <li>Repeated violations may result in termination</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-display text-base font-semibold">
                6. Geographic Restrictions
              </h3>
              <p className="mt-2 text-foreground font-medium">Vehicle may be driven within:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Dallas County</li>
                <li>Surrounding counties</li>
              </ul>
              <p className="mt-3 text-foreground font-medium">
                6.2 Prohibited travel without written permission
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Travel more than 50 miles outside Dallas County</li>
                <li>Travel outside Texas</li>
                <li>Long-distance interstate trips</li>
                <li>Road trips or vacation travel</li>
              </ul>
              <p className="mt-3 text-foreground font-medium">6.3 Penalties</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Out-of-area violation fee: $750 + $1.00 per unauthorized mile</li>
                <li>Out-of-state violation fee: $1,500 + $1.25 per unauthorized mile</li>
                <li>Failure to return vehicle upon request: $100 per day + recovery costs</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-display text-base font-semibold">
                7. Accidents &amp; Reporting
              </h3>
              <p className="mt-2 text-foreground font-medium">Lessee must:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Report all accidents within 12 hours</li>
                <li>File a police report at the scene (always)</li>
                <li>Take photos and gather all driver information</li>
                <li>State on the report: “This is a rental vehicle.”</li>
              </ul>
              <p className="mt-3 text-foreground font-medium">Lessee is responsible for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The first $500 deductible per incident</li>
                <li>Full damages if the accident is not reported properly</li>
              </ul>
              <p className="mt-3">Failure to report results in automatic loss of deposit.</p>
            </section>

            <section>
              <h3 className="text-foreground font-display text-base font-semibold">
                8. Inspections
              </h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Mandatory monthly in-person inspection</li>
                <li>Before-pickup and after-return photos/videos required</li>
                <li>Digital checklist must be signed at pickup and return</li>
                <li>Failure to attend inspections is a contract violation</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-display text-base font-semibold">
                9. Termination
              </h3>
              <p className="mt-2 text-foreground font-medium">Lessor may terminate immediately for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Non-payment</li>
                <li>Unauthorized travel</li>
                <li>Failure to maintain vehicle</li>
                <li>Suspicious or illegal activity</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-display text-base font-semibold">
                10. Acknowledgment
              </h3>
              <p className="mt-2">
                Lessee acknowledges full understanding of all rules, fees, and responsibilities.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border border-border p-4">
                  <p className="text-foreground font-medium">Lessor</p>
                  <p>Royalty Luxury Transportation Services</p>
                  <p>Name: Harry Obuobisa</p>
                  <p className="mt-3">Date: __________________</p>
                  <p>Signature: __________________</p>
                </div>
                <div className="rounded-md border border-border p-4">
                  <p className="text-foreground font-medium">Lessee</p>
                  <p>Name: __________________</p>
                  <p className="mt-3">Date: __________________</p>
                  <p>Signature: __________________</p>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
