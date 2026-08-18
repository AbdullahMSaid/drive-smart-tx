/**
 * Waitlist signups — deliberately separate from rental leads.
 *
 * A waitlist entry is an interest record, not a rental request: it never enters
 * the AI qualification pipeline, never triggers outcome emails, and never
 * appears in lead metrics. That separation is the whole point — it keeps
 * "contact me later" out of the queue the owner works through today.
 *
 * Table + RLS: `supabase/schema-v6.sql` (anon INSERT only, owner SELECT).
 */
import { supabase } from "@/integrations/supabase/client";

export type WaitlistReason =
  /** Interested but not ready to rent right now. */
  | "not-ready"
  /** Wants a vehicle that isn't in the fleet yet. */
  | "vehicle-unavailable"
  /** Submitted a request that didn't meet a requirement. */
  | "not-eligible"
  | "other";

export type WaitlistTimeframe =
  | "within-month"
  | "one-to-three-months"
  | "three-plus-months"
  | "unsure";

export const WAITLIST_TIMEFRAME_LABELS: Record<WaitlistTimeframe, string> = {
  "within-month": "Within a month",
  "one-to-three-months": "1–3 months",
  "three-plus-months": "3+ months",
  unsure: "Not sure yet",
};

export interface WaitlistInput {
  fullName: string;
  email: string;
  phone?: string;
  reason: WaitlistReason;
  timeframe?: WaitlistTimeframe | "";
  vehicleId?: string | null;
  vehicleName?: string | null;
  notes?: string;
  /** Set when the entry came from an already-submitted rental request. */
  sourceSubmissionId?: string | null;
}

export async function joinWaitlist(input: WaitlistInput): Promise<void> {
  const { error } = await supabase.from("waitlist_signups").insert({
    full_name: input.fullName.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    reason: input.reason,
    timeframe: input.timeframe || null,
    vehicle_id: input.vehicleId || null,
    vehicle_name: input.vehicleName || null,
    notes: input.notes?.trim() || null,
    source_submission_id: input.sourceSubmissionId || null,
  });
  if (error) throw new Error(error.message);
}
