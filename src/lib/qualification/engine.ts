/**
 * Deterministic lead qualification engine.
 *
 * PURE MODULE — no UI, no Supabase, no network, no AI. Given the raw intake
 * answers (plus the selected vehicle) it returns a fully structured result.
 * Persistence lives in `src/lib/lead-qualification.ts`; a future server-side
 * AI review consumes this result but must never replace it.
 */
import {
  PREMIUM_SUV_MIN_DAYS,
  MIN_RENTAL_AGE_PLACEHOLDER,
  type Vehicle,
} from "@/data/vehicles";

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

/**
 * Persisted status values (kept identical to the existing
 * `qualification_results.rule_status` check constraint — no migration needed).
 */
export type QualStatus =
  | "high-priority"
  | "needs-review"
  | "missing-info"
  | "not-eligible";

/** Richer band used for reporting; derived from score + protections. */
export type QualTier = "rejected" | "excellent" | "good" | "manual-review" | "low-quality";

export interface QualifiedLead {
  submissionId: string;
  submittedAt: string;
  /** rental_leads.id, set once the lead is persisted. */
  leadId?: string;
  data: LeadFormData;
  vehicleName: string | null;
  rentalDurationDays: number | null;
  /** Protected status — hard rejection always wins over the score. */
  status: QualStatus;
  tier: QualTier;
  /** 0–100, capped. */
  score: number;
  /** True when at least one deterministic hard rejection fired. */
  hardRejected: boolean;
  /** Reasons the lead is ineligible (empty unless hardRejected). */
  hardRejections: string[];
  /** Reasons the lead can never be high priority (manual review). */
  manualReviewReasons: string[];
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

/** Phrases that indicate an illegal or otherwise prohibited use. */
const PROHIBITED_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(drug|drugs|narcotic|narcotics|cocaine|meth|weed run|trap house)\b/i, label: "drug-related activity" },
  { pattern: /\b(smuggl\w*|traffick\w*|human cargo)\b/i, label: "smuggling or trafficking" },
  { pattern: /\b(stolen|steal|rob|robbery|heist|burglar\w*)\b/i, label: "theft or robbery" },
  { pattern: /\b(gun run|guns? deal|weapons? deal|illegal firearm\w*)\b/i, label: "illegal weapons" },
  { pattern: /\b(street race|street racing|drag race|drag racing|racing event)\b/i, label: "street racing" },
  { pattern: /\b(evade police|evading police|outrun (the )?cops|getaway)\b/i, label: "evading law enforcement" },
  { pattern: /\b(illegal|unlawful|crime|criminal activity)\b/i, label: "explicitly illegal activity" },
  { pattern: /\b(sublease|sublet|re-?rent|rent it out|turo)\b/i, label: "unauthorized subleasing of the vehicle" },
  { pattern: /\b(off-?road\w*|towing|tow a trailer|haul(ing)? a trailer)\b/i, label: "prohibited off-road or towing use" },
];

/** Phrases in notes that objectively need a human to clarify. */
const CLARIFY_PATTERNS: RegExp[] = [
  /\bnot sure\b/i,
  /\bunsure\b/i,
  /\bmaybe\b/i,
  /\bdepends\b/i,
  /\btbd\b/i,
  /\bcall me to explain\b/i,
  /\bi'?ll explain\b/i,
  /\blong story\b/i,
  /\bit'?s complicated\b/i,
];

function detectProhibitedPurpose(data: LeadFormData): string[] {
  const haystack = `${data.rentalPurpose} ${data.notes}`;
  const hits: string[] = [];
  for (const { pattern, label } of PROHIBITED_PATTERNS) {
    if (pattern.test(haystack)) hits.push(label);
  }
  return hits;
}

/** Notes that objectively contradict the structured answers. */
function detectNoteContradictions(data: LeadFormData): string[] {
  const n = data.notes.toLowerCase();
  if (!n.trim()) return [];
  const out: string[] = [];

  if (data.hasLicense === "yes" && /\b(no|don'?t have a|without a|expired|suspended)\s+(driver'?s\s+)?licen[cs]e\b/.test(n)) {
    out.push("Notes mention a license problem but the form says the license is valid");
  }
  if (data.licenseSuspended === "no" && /\b(suspend\w*|revok\w*)\b/.test(n)) {
    out.push("Notes mention a suspension but the form says the license is not suspended");
  }
  if (data.hasInsurance === "yes" && /\b(no|without|don'?t have|dropped my)\s+insurance\b/.test(n)) {
    out.push("Notes mention no insurance but the form says insurance is active");
  }
  if (
    data.additionalDriver === "no" &&
    /\b(second driver|another driver|additional driver|my (wife|husband|friend|brother|sister|son|daughter|partner|cousin) will (also )?drive)\b/.test(n)
  ) {
    out.push("Notes mention another driver but the form says sole driver");
  }
  if (data.drivingHistory === "no" && /\b(accident|dui|dwi|ticket|violation|at-?fault|wreck)\b/.test(n)) {
    out.push("Notes mention an incident but the form reports a clean driving history");
  }
  if (data.proofOfIncome === "yes" && /\b(no pay ?stub|cash only|paid in cash|can'?t prove income)\b/.test(n)) {
    out.push("Notes suggest income cannot be documented but the form says proof is available");
  }
  return out;
}

function detectNoteClarifications(data: LeadFormData): string[] {
  if (!data.notes.trim()) return [];
  return CLARIFY_PATTERNS.some((p) => p.test(data.notes))
    ? ["Notes contain uncertain wording that needs clarification"]
    : [];
}

function isPremiumCategory(v: Vehicle | null, cat: string): boolean {
  if (v) return v.category === "premium";
  return cat === "premium";
}

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function tierForScore(score: number): Exclude<QualTier, "rejected"> {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "manual-review";
  return "low-quality";
}

export function qualifyLead(data: LeadFormData, vehicle: Vehicle | null): QualifiedLead {
  const positive: string[] = [];
  const risks: string[] = [];
  const missing: string[] = [];
  const hardRejections: string[] = [];
  const manualReview: string[] = [];
  let score = 0;

  const duration = calcDurationDays(data.pickupDate, data.returnDate);

  // ---------- Contact ----------
  if (data.fullName && data.phone && data.email) {
    positive.push("Complete contact information");
    score += 10;
  } else {
    missing.push("Complete contact information");
  }

  // ---------- Age ----------
  const ageNum = parseAge(data.age);
  if (ageNum === null) {
    missing.push("Age");
  } else if (ageNum >= MIN_RENTAL_AGE_PLACEHOLDER) {
    positive.push(`Meets minimum age requirement (${ageNum} years old)`);
    score += 12;
  } else {
    hardRejections.push(`Under the minimum rental age of ${MIN_RENTAL_AGE_PLACEHOLDER} (${ageNum} years old)`);
  }

  // ---------- License ----------
  if (data.hasLicense === "yes") {
    positive.push("Has a valid driver's license");
    score += 12;
  } else if (data.hasLicense === "no") {
    hardRejections.push("No valid driver's license");
  } else {
    missing.push("License status");
  }

  if (data.licenseSuspended === "no") {
    positive.push("License is not suspended or expired");
    score += 8;
  } else if (data.licenseSuspended === "yes") {
    hardRejections.push("Driver's license is suspended or expired");
  } else {
    missing.push("License suspension status");
  }

  // ---------- Insurance (never high priority unless "yes") ----------
  if (data.hasInsurance === "yes") {
    positive.push("Has automobile insurance");
    score += 10;
  } else if (data.hasInsurance === "unsure") {
    risks.push("Insurance status is uncertain — needs verification");
    manualReview.push("Insurance status is uncertain");
    score += 2;
  } else if (data.hasInsurance === "no") {
    risks.push("No current automobile insurance");
    manualReview.push("No automobile insurance");
  } else {
    missing.push("Insurance status");
  }

  // ---------- Driving history ----------
  if (data.drivingHistory === "no") {
    positive.push("Clean recent driving history reported");
    score += 8;
  } else if (data.drivingHistory === "yes") {
    risks.push("Reported major accident or serious violation in the last 5 years");
    manualReview.push("Major accident or serious violation reported");
    score += 1;
  } else if (data.drivingHistory === "discuss") {
    risks.push("Driving history: customer prefers to discuss");
    manualReview.push("Driving history requires discussion");
    score += 1;
  } else {
    missing.push("Driving history");
  }

  // ---------- Income ----------
  if (!data.incomeSource) {
    missing.push("Income source");
  } else if (data.incomeSource === "other") {
    risks.push("Income source listed as 'Other' — needs verification");
    manualReview.push("Income source is 'Other'");
    score += 2;
  } else {
    positive.push(`Income source: ${INCOME_SOURCE_LABELS[data.incomeSource]}`);
    score += 6;
  }

  if (data.proofOfIncome === "yes") {
    positive.push("Can provide 2 months of income proof");
    score += 12;
  } else if (data.proofOfIncome === "no") {
    hardRejections.push("Cannot provide two months of income proof");
  } else {
    missing.push("Proof of income");
  }

  // ---------- Payments ----------
  if (data.firstWeekPayment === "yes") {
    positive.push("Can pay the first week's rental upfront");
    score += 12;
  } else if (data.firstWeekPayment === "no") {
    hardRejections.push("Cannot pay the first week's rental upfront");
  } else {
    missing.push("First week's payment");
  }

  if (data.depositReady === "yes") {
    positive.push("Prepared to pay the rental deposit");
    score += 10;
  } else if (data.depositReady === "no") {
    hardRejections.push("Cannot pay the rental deposit");
  } else if (data.depositReady === "need-pricing") {
    risks.push("Deposit readiness depends on final pricing");
    manualReview.push("Deposit readiness depends on final pricing");
    score += 4;
  } else {
    missing.push("Deposit readiness");
  }

  // ---------- Agreement & documents ----------
  if (data.agreesToAgreement === "yes") {
    positive.push("Agrees to the rental agreement, mileage limits, payment schedule, and maintenance terms");
    score += 8;
  } else if (data.agreesToAgreement === "no") {
    hardRejections.push("Refuses the rental agreement terms");
  } else {
    missing.push("Rental agreement acceptance");
  }

  if (data.willProvideDocs === "yes") {
    positive.push("Prepared to provide required documentation");
    score += 8;
  } else if (data.willProvideDocs === "no") {
    hardRejections.push("Refuses to provide the required documents");
  } else {
    missing.push("Document readiness");
  }

  // ---------- Additional driver ----------
  if (data.additionalDriver === "no") {
    positive.push("Sole driver");
    score += 4;
  } else if (data.additionalDriver === "yes") {
    risks.push("Additional driver requested — must be approved and added");
    manualReview.push("Additional driver requested");
    score += 1;
  } else {
    missing.push("Additional driver");
  }

  // ---------- Dates ----------
  if (duration && duration > 0) {
    positive.push(`Complete rental dates (${duration} day${duration === 1 ? "" : "s"})`);
    score += 6;
  } else {
    missing.push("Rental dates");
  }

  // ---------- Premium minimum ----------
  const premium = isPremiumCategory(vehicle, data.vehicleCategory);
  if (premium && duration !== null) {
    if (duration >= PREMIUM_SUV_MIN_DAYS) {
      positive.push(`Meets premium SUV ${PREMIUM_SUV_MIN_DAYS}-day minimum`);
      score += 3;
    } else {
      risks.push(`Premium SUV request under the ${PREMIUM_SUV_MIN_DAYS}-day minimum`);
      manualReview.push(`Premium SUV request under the ${PREMIUM_SUV_MIN_DAYS}-day minimum`);
    }
  }

  // ---------- Vehicle ----------
  if (vehicle) {
    positive.push(`Vehicle preference specified: ${vehicle.name}`);
    score += 3;
  } else if (data.vehicleCategory === "unsure") {
    risks.push("Specific vehicle not selected");
  }

  // ---------- Urgency ----------
  if (data.urgency === "immediate" || data.urgency === "within-week") {
    positive.push("Needs a vehicle soon");
    score += 5;
  } else if (data.urgency === "researching") {
    risks.push("Currently just researching");
    score -= 5;
  } else if (!data.urgency) {
    missing.push("Timeline");
  }

  // ---------- Purpose / notes analysis ----------
  const prohibited = detectProhibitedPurpose(data);
  for (const label of prohibited) {
    hardRejections.push(`Prohibited or illegal intended use: ${label}`);
  }

  const contradictions = detectNoteContradictions(data);
  for (const c of contradictions) {
    risks.push(c);
    manualReview.push(c);
  }

  const clarifications = detectNoteClarifications(data);
  for (const c of clarifications) {
    risks.push(c);
    manualReview.push(c);
  }

  if (missing.length > 0) {
    manualReview.push("Required information is missing");
  }

  // ---------- Protected status ----------
  const finalScore = clampScore(score);
  const hardRejected = hardRejections.length > 0;

  let status: QualStatus;
  let tier: QualTier;

  if (hardRejected) {
    status = "not-eligible";
    tier = "rejected";
  } else if (missing.length > 0) {
    status = "missing-info";
    tier = tierForScore(finalScore) === "excellent" ? "manual-review" : tierForScore(finalScore);
  } else if (manualReview.length > 0) {
    status = "needs-review";
    // Manual-review conditions can never be "excellent".
    const band = tierForScore(finalScore);
    tier = band === "excellent" || band === "good" ? "manual-review" : band;
  } else {
    tier = tierForScore(finalScore);
    status = tier === "excellent" ? "high-priority" : "needs-review";
  }

  const nextAction = hardRejected
    ? "Do not proceed to booking — contact the customer to explain the eligibility requirement that was not met."
    : status === "missing-info"
    ? "Reach out to collect the missing information before qualifying further."
    : status === "high-priority"
    ? "Confirm vehicle availability and send deposit and rental-rate details promptly."
    : tier === "manual-review"
    ? "Manual review: verify the flagged items with the customer before confirming availability."
    : "Review flagged items with the customer, then confirm availability and next steps.";

  const durationLabel = duration ? `${duration}-day` : "unspecified-duration";
  const purpose = data.rentalPurpose || "unspecified purpose";
  const vehicleName =
    vehicle?.name ??
    (data.vehicleCategory === "unsure" ? "unspecified vehicle" : `${data.vehicleCategory} vehicle`);

  const headline = hardRejected
    ? "Not eligible"
    : tier === "excellent"
    ? "High-priority"
    : tier === "good"
    ? "Good"
    : tier === "manual-review"
    ? "Manual-review"
    : "Low-quality";

  const summary =
    `${headline} ${premium ? "premium SUV" : "economy"} renter requesting a ${durationLabel} ${vehicleName} rental for ${purpose}. ` +
    `Score ${finalScore}/100. ` +
    (hardRejected ? `Hard rejection: ${hardRejections.join("; ")}. ` : "") +
    `License: ${data.hasLicense || "n/a"}. Insurance: ${data.hasInsurance || "n/a"}. Deposit: ${data.depositReady || "n/a"}. Next: ${nextAction}`;

  return {
    submissionId: generateSubmissionId(),
    submittedAt: new Date().toISOString(),
    data,
    vehicleName: vehicle?.name ?? null,
    rentalDurationDays: duration,
    status,
    tier,
    score: finalScore,
    hardRejected,
    hardRejections,
    manualReviewReasons: Array.from(new Set(manualReview)),
    positiveSignals: positive,
    riskFlags: risks,
    missingInfo: missing,
    recommendedNextAction: nextAction,
    summary,
  };
}
