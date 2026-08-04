import { PREMIUM_SUV_MIN_DAYS, MIN_RENTAL_AGE_PLACEHOLDER, type Vehicle } from "@/data/vehicles";
import { supabase } from "@/integrations/supabase/client";

export type YesNo = "yes" | "no";
export type YesNoMaybe = "yes" | "no" | "unsure";
export type ContactMethod = "phone" | "text" | "email";
export type PickupPreference = "pickup" | "delivery";
export type IncomeSource = "employed" | "self-employed" | "uber" | "lyft" | "other";

export interface LeadFormData {
  fullName: string;
  phone: string;
  email: string;
  contactMethod: ContactMethod;

  vehicleId: string;
  vehicleCategory: "economy" | "premium" | "unsure";
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  pickupPreference: PickupPreference;
  rentalPurpose: string;
  pickupArea: string;
  notes: string;

  /** Exact age in years, entered as text and parsed for qualification. */
  age: string;
  hasLicense: YesNo | "";
  licenseSuspended: YesNo | "";
  hasInsurance: YesNoMaybe | "";
  rentedBefore: YesNo | "";
  drivingHistory: "no" | "yes" | "discuss" | "";
  incomeSource: IncomeSource | "";
  proofOfIncome: YesNo | "";
  firstWeekPayment: YesNo | "";
  additionalDriver: YesNo | "";
  agreesToAgreement: YesNo | "";
  willProvideDocs: YesNo | "";
  depositReady: "yes" | "no" | "need-pricing" | "";
  urgency: "immediate" | "within-week" | "within-two-weeks" | "later" | "researching" | "";

  consentNotReservation: boolean;
  consentContact: boolean;
  consentAccurate: boolean;
}


export const emptyLead: LeadFormData = {
  fullName: "",
  phone: "",
  email: "",
  contactMethod: "phone",
  vehicleId: "",
  vehicleCategory: "unsure",
  pickupDate: "",
  pickupTime: "10:00",
  returnDate: "",
  returnTime: "10:00",
  pickupPreference: "pickup",
  rentalPurpose: "",
  pickupArea: "",
  notes: "",
  age: "",
  hasLicense: "",
  licenseSuspended: "",
  hasInsurance: "",
  rentedBefore: "",
  drivingHistory: "",
  incomeSource: "",
  proofOfIncome: "",
  firstWeekPayment: "",
  additionalDriver: "",
  agreesToAgreement: "",
  willProvideDocs: "",

  depositReady: "",
  urgency: "",
  consentNotReservation: false,
  consentContact: false,
  consentAccurate: false,
};

export type QualStatus =
  | "high-priority"
  | "needs-review"
  | "missing-info"
  | "not-eligible";

export interface QualifiedLead {
  submissionId: string;
  submittedAt: string;
  /** rental_leads.id, set once the lead is persisted. */
  leadId?: string;
  data: LeadFormData;
  vehicleName: string | null;
  rentalDurationDays: number | null;
  status: QualStatus;
  score: number;
  positiveSignals: string[];
  riskFlags: string[];
  missingInfo: string[];
  recommendedNextAction: string;
  summary: string;
}

export function calcDurationDays(start: string, end: string): number | null {
  if (!start || !end) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return null;
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
}

export function generateSubmissionId(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `LSR-${stamp}-${rand}`;
}

export function parseAge(age: string): number | null {
  const n = Number.parseInt(age, 10);
  if (Number.isNaN(n) || n < 15 || n > 100) return null;
  return n;
}

export const INCOME_SOURCE_LABELS: Record<IncomeSource, string> = {
  employed: "Employed",
  "self-employed": "Self-employed",
  uber: "Uber",
  lyft: "Lyft",
  other: "Other",
};


function isPremiumCategory(v: Vehicle | null, cat: string): boolean {
  if (v) return v.category === "premium";
  return cat === "premium";
}

export function qualifyLead(
  data: LeadFormData,
  vehicle: Vehicle | null,
): QualifiedLead {
  const positive: string[] = [];
  const risks: string[] = [];
  const missing: string[] = [];
  let score = 0;

  const duration = calcDurationDays(data.pickupDate, data.returnDate);

  // Contact
  if (data.fullName && data.phone && data.email) {
    positive.push("Complete contact information");
    score += 10;
  } else {
    missing.push("Complete contact information");
  }

  // Age (exact age entered by the customer)
  const ageNum = parseAge(data.age);
  const meetsAge: YesNo | "" = ageNum === null ? "" : ageNum >= MIN_RENTAL_AGE_PLACEHOLDER ? "yes" : "no";
  if (meetsAge === "yes") { positive.push(`Meets minimum age requirement (${ageNum} years old)`); score += 15; }
  else if (meetsAge === "no") { risks.push(`Under minimum rental age (${ageNum} years old)`); score -= 100; }
  else missing.push("Age");


  // License
  if (data.hasLicense === "yes") { positive.push("Has a valid driver's license"); score += 15; }
  else if (data.hasLicense === "no") { risks.push("No valid driver's license"); score -= 100; }
  else missing.push("License status");

  if (data.licenseSuspended === "no") { positive.push("License is not suspended or expired"); score += 10; }
  else if (data.licenseSuspended === "yes") { risks.push("License is suspended or expired"); score -= 100; }

  // Insurance
  if (data.hasInsurance === "yes") { positive.push("Has automobile insurance"); score += 10; }
  else if (data.hasInsurance === "unsure") { risks.push("Insurance status is uncertain — needs discussion"); score += 2; }
  else if (data.hasInsurance === "no") { risks.push("No current automobile insurance"); score -= 10; }

  // Driving history
  if (data.drivingHistory === "no") { positive.push("Clean recent driving history reported"); score += 8; }
  else if (data.drivingHistory === "yes") { risks.push("Reported major violation or accident in last 5 years"); score -= 5; }
  else if (data.drivingHistory === "discuss") { risks.push("Driving history: prefers to discuss"); }

  // Income
  if (data.incomeSource) {
    positive.push(`Income source: ${INCOME_SOURCE_LABELS[data.incomeSource]}`);
    score += 5;
  } else missing.push("Income source");

  if (data.proofOfIncome === "yes") { positive.push("Can provide 2 months of income proof"); score += 10; }
  else if (data.proofOfIncome === "no") { risks.push("Cannot provide proof of income"); score -= 20; }
  else missing.push("Proof of income");

  // First week's payment
  if (data.firstWeekPayment === "yes") { positive.push("Can pay the first week's rental today"); score += 12; }
  else if (data.firstWeekPayment === "no") { risks.push("Cannot pay the first week's rental today"); score -= 20; }
  else missing.push("First week's payment");

  // Additional driver
  if (data.additionalDriver === "yes") { risks.push("Additional driver requested — must be approved and added"); }
  else if (data.additionalDriver === "no") { positive.push("Sole driver"); score += 3; }
  else missing.push("Additional driver");

  // Rental agreement understanding
  if (data.agreesToAgreement === "yes") { positive.push("Agrees to rental agreement, mileage limits, payment schedule, and maintenance terms"); score += 10; }
  else if (data.agreesToAgreement === "no") { risks.push("Does not agree to rental agreement terms"); score -= 100; }
  else missing.push("Rental agreement agreement");



  // Docs
  if (data.willProvideDocs === "yes") { positive.push("Prepared to provide required documentation"); score += 10; }
  else if (data.willProvideDocs === "no") { risks.push("Not prepared to provide required documentation"); score -= 50; }
  else missing.push("Document readiness");

  // Deposit
  if (data.depositReady === "yes") { positive.push("Prepared to pay rental deposit"); score += 10; }
  else if (data.depositReady === "need-pricing") { risks.push("Deposit readiness depends on final pricing"); score += 2; }
  else if (data.depositReady === "no") { risks.push("Not prepared to pay rental deposit"); score -= 20; }

  // Dates
  if (duration && duration > 0) {
    positive.push(`Complete rental dates (${duration} day${duration === 1 ? "" : "s"})`);
    score += 8;
  } else {
    missing.push("Rental dates");
  }

  // Premium SUV minimum
  const premium = isPremiumCategory(vehicle, data.vehicleCategory);
  if (premium) {
    if (duration && duration >= PREMIUM_SUV_MIN_DAYS) {
      positive.push(`Meets premium SUV ${PREMIUM_SUV_MIN_DAYS}-day minimum`);
      score += 5;
    } else if (duration && duration < PREMIUM_SUV_MIN_DAYS) {
      risks.push(`Premium SUV request under ${PREMIUM_SUV_MIN_DAYS}-day minimum`);
      score -= 100;
    }
  }

  // Vehicle selected
  if (!vehicle && data.vehicleCategory === "unsure") {
    risks.push("Specific vehicle not selected");
  } else if (vehicle) {
    positive.push(`Vehicle preference specified: ${vehicle.name}`);
    score += 3;
  }

  // Urgency
  if (data.urgency === "immediate" || data.urgency === "within-week") {
    positive.push("Needs vehicle soon");
    score += 6;
  } else if (data.urgency === "researching") {
    risks.push("Currently just researching");
    score -= 5;
  }

  // Determine status
  const hardIneligible =
    data.meetsAge === "no" ||
    data.hasLicense === "no" ||
    data.licenseSuspended === "yes" ||
    data.willProvideDocs === "no" ||
    (premium && duration !== null && duration < PREMIUM_SUV_MIN_DAYS);

  let status: QualStatus;
  if (hardIneligible) status = "not-eligible";
  else if (missing.length >= 2) status = "missing-info";
  else if (score >= 55 && risks.length <= 1) status = "high-priority";
  else status = "needs-review";

  const nextAction =
    status === "not-eligible"
      ? "Contact customer to explain eligibility requirements; do not proceed to booking."
      : status === "missing-info"
      ? "Reach out to collect missing information before qualifying further."
      : status === "high-priority"
      ? "Confirm vehicle availability and send deposit and rental-rate details promptly."
      : "Review flagged items with the customer, then confirm availability and next steps.";

  const durationLabel = duration ? `${duration}-day` : "unspecified-duration";
  const purpose = data.rentalPurpose || "unspecified purpose";
  const vehicleName = vehicle?.name ?? (data.vehicleCategory === "unsure" ? "unspecified vehicle" : `${data.vehicleCategory} vehicle`);
  const summary = `${status === "high-priority" ? "High-priority" : "Potential"} ${premium ? "premium SUV" : "economy"} renter requesting a ${durationLabel} ${vehicleName} rental for ${purpose}. License: ${data.hasLicense || "n/a"}. Insurance: ${data.hasInsurance || "n/a"}. Deposit: ${data.depositReady || "n/a"}. Next: ${nextAction}`;

  return {
    submissionId: generateSubmissionId(),
    submittedAt: new Date().toISOString(),
    data,
    vehicleName: vehicle?.name ?? null,
    rentalDurationDays: duration,
    status,
    score,
    positiveSignals: positive,
    riskFlags: risks,
    missingInfo: missing,
    recommendedNextAction: nextAction,
    summary,
  };
}

// Persistence — Supabase (schema v2: rental_leads + qualification_results).
//
// RLS on rental_leads allows anon INSERT only (no SELECT), so the row id is
// generated client-side and reused instead of relying on `.select()` after
// insert.
export async function saveLead(lead: QualifiedLead): Promise<void> {
  const d = lead.data;
  const leadId = crypto.randomUUID();

  const { error } = await supabase.from("rental_leads").insert({
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
  });

  if (error) throw new Error(error.message);

  lead.leadId = leadId;
}

export async function runAiLeadQualification(lead: QualifiedLead): Promise<QualifiedLead> {
  // No model call yet — persist the deterministic qualifyLead() output and
  // return it unchanged.
  if (lead.leadId) {
    const { error } = await supabase.from("qualification_results").insert({
      lead_id: lead.leadId,
      rule_status: lead.status,
      rule_score: lead.score,
      rule_positive_signals: lead.positiveSignals,
      rule_risk_flags: lead.riskFlags,
      rule_missing_info: lead.missingInfo,
      rule_recommended_action: lead.recommendedNextAction,
      rule_summary: lead.summary,
    });

    // qualification_results has RLS enabled with no anon policy, so this write
    // is expected to be rejected from the browser until the pipeline runs
    // server-side with the service_role key. Never fail the user's submission
    // because of it — the lead itself is already saved.
    if (error) {
      console.warn("[qualification_results] insert skipped:", error.message);
    }
  }

  return lead;
}


