import { describe, expect, it } from "vitest";

import { emptyLead, type QualifiedLead } from "./engine";
import { aiFailureFallback, aiReviewSchema, protectAiDecision } from "./ai-review";

const baseLead: QualifiedLead = {
  submissionId: "LSR-TEST",
  submittedAt: "2026-08-11T00:00:00.000Z",
  data: { ...emptyLead },
  vehicleName: "Honda Accord",
  rentalDurationDays: 7,
  status: "high-priority",
  tier: "excellent",
  score: 95,
  hardRejected: false,
  hardRejections: [],
  manualReviewReasons: [],
  positiveSignals: [],
  riskFlags: [],
  missingInfo: [],
  recommendedNextAction: "Contact promptly.",
  summary: "Excellent lead.",
};

const review = aiReviewSchema.parse({
  priority: "high",
  summary: "Strong submission with complete information.",
  inconsistencies: [],
  additionalRiskFlags: [],
  missingInformation: [],
  recommendedAction: "Confirm availability.",
  suggestedCustomerReply: "Thank you. We will confirm availability shortly.",
});

describe("AI decision protection", () => {
  it("preserves a high-priority result when no protection fires", () => {
    expect(protectAiDecision(baseLead, review).finalStatus).toBe("high");
  });

  it("never allows AI to approve a hard-rejected lead", () => {
    const lead = {
      ...baseLead,
      status: "not-eligible" as const,
      tier: "rejected" as const,
      hardRejected: true,
      hardRejections: ["Driver's license is suspended"],
    };
    const protectedReview = protectAiDecision(lead, review);
    expect(protectedReview.finalStatus).toBe("not_eligible");
    expect(protectedReview.priority).toBe("low");
  });

  it("routes evidence-based inconsistencies to manual review", () => {
    const protectedReview = protectAiDecision(baseLead, {
      ...review,
      inconsistencies: ["Notes mention another driver but the form says sole driver."],
    });
    expect(protectedReview.finalStatus).toBe("manual_review");
  });

  it("routes deterministic review cases to manual review", () => {
    const lead = { ...baseLead, status: "needs-review" as const, tier: "manual-review" as const };
    expect(protectAiDecision(lead, review).finalStatus).toBe("manual_review");
  });

  it("falls back safely when the model is unavailable", () => {
    const fallback = aiFailureFallback(baseLead);
    expect(fallback.finalStatus).toBe("manual_review");
    expect(fallback.summary).toBe(baseLead.summary);
  });
});
