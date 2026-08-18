import { useState, type ReactNode } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  joinWaitlist,
  WAITLIST_TIMEFRAME_LABELS,
  type WaitlistReason,
  type WaitlistTimeframe,
} from "@/lib/waitlist";
import { cn } from "@/lib/utils";

/**
 * One compact dialog serves every waitlist entry point — the coming-soon
 * vehicle card, the "not ready yet" link on the intake form, and the
 * confirmation screen. Deliberately a dialog rather than a page or section so
 * the waitlist adds no new route, nav item, or scroll length to the site.
 */
export function WaitlistDialog({
  trigger,
  reason,
  vehicleId,
  vehicleName,
  prefill,
  sourceSubmissionId,
  title = "Join the waitlist",
  description = "Leave your details and the rental team will reach out when you're ready.",
}: {
  trigger: ReactNode;
  reason: WaitlistReason;
  vehicleId?: string | null;
  vehicleName?: string | null;
  prefill?: { fullName?: string; email?: string; phone?: string };
  sourceSubmissionId?: string | null;
  title?: string;
  description?: string;
}) {
  const [fullName, setFullName] = useState(prefill?.fullName ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [timeframe, setTimeframe] = useState<WaitlistTimeframe | "">("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!fullName.trim()) return setError("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    setBusy(true);
    setError(null);
    try {
      await joinWaitlist({
        fullName,
        email,
        phone,
        reason,
        timeframe,
        vehicleId,
        vehicleName,
        notes,
        sourceSubmissionId,
      });
      setDone(true);
    } catch (e) {
      console.error("[waitlist] failed:", e);
      setError("We couldn't save that. Please try again, or call (614) 359-1370.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        {done ? (
          <div className="py-2 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
            <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
              You're on the waitlist.
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We'll contact you at {email} when there's an update
              {vehicleName ? ` on the ${vehicleName}` : ""}. No rental request has been created.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-lg">{title}</DialogTitle>
              <DialogDescription>
                {description}
                {vehicleName ? ` Vehicle of interest: ${vehicleName}.` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Full name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  maxLength={80}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={120}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Phone (optional)</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 555-1234"
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">When do you expect to need a vehicle?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(WAITLIST_TIMEFRAME_LABELS) as WaitlistTimeframe[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTimeframe(key)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-sm font-medium transition",
                        timeframe === key
                          ? "border-gold bg-gold/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
                      )}
                    >
                      {WAITLIST_TIMEFRAME_LABELS[key]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Anything else? (optional)</Label>
                <Textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What you're looking for, dates you have in mind…"
                  maxLength={500}
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                onClick={submit}
                disabled={busy}
                className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
              >
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Join the waitlist"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Joining the waitlist is not a rental request and does not reserve a vehicle.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
