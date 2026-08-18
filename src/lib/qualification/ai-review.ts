import { z } from "zod";

import type { QualifiedLead } from "./engine";

// v2: shortened intake (7 qualification questions), three-way insurance answer,
// and deposit/agreement acceptance moved to the closing checkboxes.
export const AI_REVIEW_PROMPT_VERSION = "rental-lead-review-v2";

export const aiReviewSchema = z.object({
  priority: z.enum(["high", "normal", "low", "manual_review"]),
  summary: z.string().min(1).max(1200),
  inconsistencies: z.array(z.string().min(1).max(300)).max(10),
  additionalRiskFlags: z.array(z.string().min(1).max(300)).max(10),
  missingInformation: z.array(z.string().min(1).max(300)).max(10),
  recommendedAction: z.string().min(1).max(800),
  suggestedCustomerReply: z.string().min(1).max(1200),
});

export type AiLeadReview = z.infer<typeof aiReviewSchema>;

export type FinalQualificationStatus = "high" | "normal" | "low" | "manual_review" | "not_eligible";

export interface ProtectedAiReview extends AiLeadReview {
  finalStatus: FinalQualificationStatus;
  decisionReason: string;
}

/**
 * Merge model output with deterministic policy. This is deliberately pure so
 * the model can never bypass business rules through prompt behavior.
 */
export function protectAiDecision(lead: QualifiedLead, review: AiLeadReview): ProtectedAiReview {
  if (lead.hardRejected || lead.status === "not-eligible") {
    return {
      ...review,
      priority: "low",
      finalStatus: "not_eligible",
      decisionReason: `Protected hard rejection: ${lead.hardRejections.join("; ")}`,
    };
  }

  const needsManualReview =
    lead.status === "needs-review" ||
    lead.status === "missing-info" ||
    review.priority === "manual_review" ||
    review.inconsistencies.length > 0;

  if (needsManualReview) {
    return {
      ...review,
      priority: "manual_review",
      finalStatus: "manual_review",
      decisionReason:
        review.inconsistencies.length > 0
          ? "AI found one or more evidence-based inconsistencies."
          : "Deterministic policy or AI review requires owner review.",
    };
  }

  return {
    ...review,
    finalStatus: review.priority,
    decisionReason: "No protected rule changed the AI priority.",
  };
}

export function buildAiReviewMessages(lead: QualifiedLead) {
  const system = `You review rental lead submissions for a small vehicle-rental owner.

Return only the requested structured output. Base every statement on the supplied submission. Do not invent facts, infer protected characteristics, accuse the applicant of fraud or dishonesty without objective evidence, or reject based on tone or writing style.

The deterministic business decision is authoritative. You may identify supported contradictions or unclear requests and recommend manual review, but you may not convert a deterministic rejection into approval. Keep the owner summary concise and operational. The suggested customer reply must be polite, neutral, and must not promise availability or approval.

Rental policy you must apply when reviewing:
- Minimum renter age is 25, and a valid, unsuspended driver's license is required.
- Every person who will drive the vehicle must submit their own rental request. The form does not ask about additional drivers, so if the notes mention someone else driving, flag it for manual review rather than treating it as approved.
- "hasInsurance": "need-provided" means the applicant is asking for insurance to be arranged as part of the rental. That is a legitimate answer, not a rejection, but it requires a quote and must go to manual review.
- Deposit readiness and acceptance of the rental agreement terms (deposit, weekly payments, mileage limits, maintenance) are captured by the three closing acceptances rather than as separate questions. Treat a false value in any of them as unconfirmed.
- Do not report a field as missing information just because it is absent from this payload; only the listed fields are collected.`;

  const payload = {
    normalizedLead: {
      contactMethod: lead.data.contactMethod,
      vehicleId: lead.data.vehicleId || null,
      vehicleName: lead.vehicleName,
      vehicleCategory: lead.data.vehicleCategory,
      pickupDate: lead.data.pickupDate,
      pickupTime: lead.data.pickupTime,
      returnDate: lead.data.returnDate,
      returnTime: lead.data.returnTime,
      rentalDurationDays: lead.rentalDurationDays,
      pickupPreference: lead.data.pickupPreference,
      rentalPurpose: lead.data.rentalPurpose,
      pickupArea: lead.data.pickupArea,
      notes: lead.data.notes,
      age: lead.data.age,
      hasLicense: lead.data.hasLicense,
      hasInsurance: lead.data.hasInsurance,
      drivingHistory: lead.data.drivingHistory,
      proofOfIncome: lead.data.proofOfIncome,
      willProvideDocs: lead.data.willProvideDocs,
      urgency: lead.data.urgency,
      acceptances: {
        understandsNotAReservation: lead.data.consentNotReservation,
        agreesToBeContacted: lead.data.consentContact,
        confirmsAccurateAndAcceptsTerms: lead.data.consentAccurate,
      },
    },
    deterministicResult: {
      score: lead.score,
      status: lead.status,
      tier: lead.tier,
      hardRejected: lead.hardRejected,
      hardRejections: lead.hardRejections,
      manualReviewReasons: lead.manualReviewReasons,
      positiveSignals: lead.positiveSignals,
      riskFlags: lead.riskFlags,
      missingInformation: lead.missingInfo,
      recommendedAction: lead.recommendedNextAction,
    },
  };

  return [
    { role: "system" as const, content: system },
    {
      role: "user" as const,
      content: `Review this submission:\n${JSON.stringify(payload, null, 2)}`,
    },
  ];
}

export function aiFailureFallback(lead: QualifiedLead): ProtectedAiReview {
  const rejected = lead.hardRejected || lead.status === "not-eligible";
  return {
    priority: rejected ? "low" : "manual_review",
    finalStatus: rejected ? "not_eligible" : "manual_review",
    summary: lead.summary,
    inconsistencies: [],
    additionalRiskFlags: [],
    missingInformation: lead.missingInfo,
    recommendedAction: rejected
      ? lead.recommendedNextAction
      : "Manually review this lead because the AI review was unavailable.",
    suggestedCustomerReply:
      "Thank you for your rental request. Our team received your information and will contact you after reviewing availability and next steps.",
    decisionReason: rejected
      ? `Protected hard rejection: ${lead.hardRejections.join("; ")}`
      : "AI review failed; routed to manual review.",
  };
}
