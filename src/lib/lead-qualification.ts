import { PREMIUM_SUV_MIN_DAYS, MIN_RENTAL_AGE_PLACEHOLDER, type Vehicle } from "@/data/vehicles";

export type YesNo = "yes" | "no";
export type YesNoMaybe = "yes" | "no" | "unsure";
export type ContactMethod = "phone" | "text" | "email";
export type PickupPreference = "pickup" | "delivery";

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

  meetsAge: YesNo | "";
  hasLicense: YesNo | "";
  licenseSuspended: YesNo | "";
  hasInsurance: YesNoMaybe | "";
  rentedBefore: YesNo | "";
  drivingHistory: "no" | "yes" | "discuss" | "";
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
  meetsAge: "",
  hasLicense: "",
  licenseSuspended: "",
  hasInsurance: "",
  rentedBefore: "",
  drivingHistory: "",
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

  // Age
  if (data.meetsAge === "yes") { positive.push(`Meets minimum age requirement (${MIN_RENTAL_AGE_PLACEHOLDER}+)`); score += 15; }
  else if (data.meetsAge === "no") { risks.push("Does not meet minimum rental age"); score -= 100; }
  else missing.push("Age confirmation");

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

// Placeholder service functions — swap for real Supabase / edge function later.
export async function saveLead(lead: QualifiedLead): Promise<void> {
  // TODO: connect to Lovable Cloud — insert into `rental_leads` table.
  // Never expose API keys from the browser. Any AI request must go through
  // a secure backend function.
  await new Promise((r) => setTimeout(r, 600));
  if (typeof console !== "undefined") {
    console.info("[mock] saveLead", lead.submissionId, lead.status);
  }
}

export async function runAiLeadQualification(lead: QualifiedLead): Promise<QualifiedLead> {
  // TODO: call a server function that uses Lovable AI Gateway to enrich the
  // qualification summary. Returning the deterministic result for now.
  return lead;
}
