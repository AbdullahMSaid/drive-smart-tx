/**
 * Lead persistence + pipeline seam.
 *
 * The deterministic engine lives in `./qualification/engine` and is pure. This
 * module only re-exports it and owns the database writes, so scoring stays
 * testable and free of UI/DB concerns.
 */
import { MIN_RENTAL_AGE_PLACEHOLDER } from "@/data/vehicles";
import { supabase } from "@/integrations/supabase/client";
import { parseAge, type QualifiedLead } from "./qualification/engine";
import { processLeadOnServer } from "./qualification/process-lead.functions";

export * from "./qualification/engine";

// Persistence — Supabase (schema v2/v3: rental_leads + qualification_results).
//
// RLS on rental_leads allows anon INSERT only (no SELECT), so the row id is
// generated client-side and reused instead of relying on `.select()` after
// insert.

/** Column names quoted in a PostgREST/Postgres "unknown column" error. */
function unknownColumnsFromError(message: string): string[] {
  const found = new Set<string>();
  // PostgREST: Could not find the 'processing_status' column of 'rental_leads'
  // Postgres:  column "processing_status" of relation "rental_leads" does not exist
  for (const m of message.matchAll(/'([a-z0-9_]+)' column/gi)) found.add(m[1]);
  for (const m of message.matchAll(/column "([a-z0-9_]+)"/gi)) found.add(m[1]);
  return [...found];
}

/** Columns the lead is meaningless without — never dropped on retry. */
const REQUIRED_COLUMNS = new Set([
  "id",
  "submission_id",
  "submitted_at",
  "full_name",
  "phone",
  "email",
]);

export async function saveLead(lead: QualifiedLead): Promise<void> {
  const d = lead.data;
  const leadId = crypto.randomUUID();

  const row: Record<string, unknown> = {
    id: leadId,

    submission_id: lead.submissionId,
    submitted_at: lead.submittedAt,

    // Step 0: Contact
    full_name: d.fullName,
    phone: d.phone,
    email: d.email,
    contact_method: d.contactMethod,

    // Step 1: Rental
    vehicle_id: d.vehicleId || null,
    vehicle_name: lead.vehicleName,
    vehicle_category: d.vehicleCategory,
    pickup_date: d.pickupDate,
    pickup_time: d.pickupTime,
    return_date: d.returnDate,
    return_time: d.returnTime,
    rental_duration_days: lead.rentalDurationDays,
    pickup_preference: d.pickupPreference,
    rental_purpose: d.rentalPurpose,
    pickup_area: d.pickupArea || null,
    notes: d.notes || null,

    // Step 2: Qualification (raw answers)
    meets_age: (parseAge(d.age) ?? 0) >= MIN_RENTAL_AGE_PLACEHOLDER ? "yes" : "no",
    age: parseAge(d.age),
    has_license: d.hasLicense,
    license_suspended: d.licenseSuspended,
    has_insurance: d.hasInsurance,
    rented_before: d.rentedBefore,
    driving_history: d.drivingHistory,
    income_source: d.incomeSource,
    proof_of_income: d.proofOfIncome,
    first_week_payment: d.firstWeekPayment,
    additional_driver: d.additionalDriver,
    agrees_to_agreement: d.agreesToAgreement,
    will_provide_docs: d.willProvideDocs,
    deposit_ready: d.depositReady,
    urgency: d.urgency,

    // Step 3: Review consent
    consent_not_reservation: d.consentNotReservation,
    consent_contact: d.consentContact,
    consent_accurate: d.consentAccurate,

    // Pipeline (NOT the owner-editable lead_status): raw lead awaiting
    // deterministic + future AI processing.
    processing_status: "new",
  };

  // Some deployments haven't applied the newest migration yet. Rather than
  // failing the visitor's submission over an optional pipeline/intake column,
  // drop the columns the database reports as unknown and retry.
  let error: { message: string } | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await supabase.from("rental_leads").insert(row);
    error = res.error ?? null;
    if (!error) break;

    const unknown = unknownColumnsFromError(error.message).filter(
      (c) => c in row && !REQUIRED_COLUMNS.has(c),
    );
    if (unknown.length === 0) break;
    for (const c of unknown) delete row[c];
    console.warn("[saveLead] retrying without unknown column(s):", unknown.join(", "));
  }

  if (error) throw new Error(error.message);

  lead.leadId = leadId;
}

export async function runAiLeadQualification(lead: QualifiedLead): Promise<QualifiedLead> {
  if (!lead.leadId) return lead;
  try {
    const result = await processLeadOnServer({ data: { leadId: lead.leadId } });
    return result.lead;
  } catch (error) {
    // The raw lead is already safely stored. AI/database migration problems
    // must not turn a successful customer submission into a visible failure.
    console.warn("[lead qualification pipeline] deferred:", error);
    return lead;
  }
}
