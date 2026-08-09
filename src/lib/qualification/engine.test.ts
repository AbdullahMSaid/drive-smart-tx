import { describe, expect, it } from "vitest";

import { MIN_RENTAL_AGE_PLACEHOLDER, PREMIUM_SUV_MIN_DAYS, vehicles } from "@/data/vehicles";
import {
  clampScore,
  emptyLead,
  qualifyLead,
  tierForScore,
  type LeadFormData,
} from "@/lib/qualification/engine";

const economyVehicle = vehicles.find((v) => v.category === "economy")!;
const premiumVehicle = vehicles.find((v) => v.category === "premium")!;

/** A fully answered, clean, excellent lead. */
function excellent(overrides: Partial<LeadFormData> = {}): LeadFormData {
  return {
    ...emptyLead,
    fullName: "Jane Renter",
    phone: "2145550123",
    email: "jane@example.com",
    contactMethod: "phone",
    vehicleId: economyVehicle.id,
    vehicleCategory: "economy",
    pickupDate: "2026-09-01",
    returnDate: "2026-09-08",
    rentalPurpose: "Daily commuting to work",
    pickupArea: "Dallas",
    age: "34",
    hasLicense: "yes",
    licenseSuspended: "no",
    hasInsurance: "yes",
    rentedBefore: "yes",
    drivingHistory: "no",
    incomeSource: "employed",
    proofOfIncome: "yes",
    firstWeekPayment: "yes",
    additionalDriver: "no",
    agreesToAgreement: "yes",
    willProvideDocs: "yes",
    depositReady: "yes",
    urgency: "immediate",
    consentNotReservation: true,
    consentContact: true,
    consentAccurate: true,
    ...overrides,
  };
}

describe("minimum age", () => {
  it("is 25", () => {
    expect(MIN_RENTAL_AGE_PLACEHOLDER).toBe(25);
  });

  it("accepts exactly 25 and rejects 24", () => {
    expect(qualifyLead(excellent({ age: "25" }), economyVehicle).hardRejected).toBe(false);
    const r = qualifyLead(excellent({ age: "24" }), economyVehicle);
    expect(r.hardRejected).toBe(true);
    expect(r.status).toBe("not-eligible");
  });
});

describe("excellent lead", () => {
  const result = qualifyLead(excellent(), economyVehicle);

  it("is high priority and excellent", () => {
    expect(result.status).toBe("high-priority");
    expect(result.tier).toBe("excellent");
  });

  it("scores 90 or above and never exceeds 100", () => {
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("has no rejections, manual-review reasons or missing info", () => {
    expect(result.hardRejections).toEqual([]);
    expect(result.manualReviewReasons).toEqual([]);
    expect(result.missingInfo).toEqual([]);
  });

  it("returns a structured result", () => {
    expect(result.positiveSignals.length).toBeGreaterThan(5);
    expect(result.recommendedNextAction).toBeTruthy();
    expect(result.summary).toContain("Score");
  });
});

describe("hard rejections", () => {
  const cases: { name: string; data: Partial<LeadFormData>; match: RegExp }[] = [
    { name: "under age 25", data: { age: "21" }, match: /minimum rental age/i },
    { name: "no valid driver's license", data: { hasLicense: "no" }, match: /no valid driver/i },
    { name: "suspended or expired license", data: { licenseSuspended: "yes" }, match: /suspended or expired/i },
    { name: "refuses required documents", data: { willProvideDocs: "no" }, match: /required documents/i },
    { name: "no two months of income proof", data: { proofOfIncome: "no" }, match: /income proof/i },
    { name: "cannot pay the deposit", data: { depositReady: "no" }, match: /deposit/i },
    { name: "cannot pay the first week upfront", data: { firstWeekPayment: "no" }, match: /first week/i },
    { name: "refuses the rental agreement", data: { agreesToAgreement: "no" }, match: /rental agreement/i },
    {
      name: "illegal purpose in the selected purpose",
      data: { rentalPurpose: "Need it for a drug run" },
      match: /prohibited or illegal/i,
    },
    {
      name: "illegal purpose in the notes",
      data: { notes: "I plan to sublease it on Turo" },
      match: /prohibited or illegal/i,
    },
  ];

  for (const c of cases) {
    it(`rejects: ${c.name}`, () => {
      const r = qualifyLead(excellent(c.data), economyVehicle);
      expect(r.hardRejected).toBe(true);
      expect(r.status).toBe("not-eligible");
      expect(r.tier).toBe("rejected");
      expect(r.hardRejections.join(" | ")).toMatch(c.match);
      expect(r.recommendedNextAction).toMatch(/do not proceed/i);
    });
  }

  it("overrides a perfect score", () => {
    const r = qualifyLead(excellent({ hasLicense: "no" }), economyVehicle);
    expect(r.score).toBeGreaterThan(60);
    expect(r.status).toBe("not-eligible");
  });
});

describe("manual-review conditions (never high priority)", () => {
  const cases: { name: string; data: Partial<LeadFormData> }[] = [
    { name: "insurance no", data: { hasInsurance: "no" } },
    { name: "insurance unsure", data: { hasInsurance: "unsure" } },
    { name: "major accident or serious violation", data: { drivingHistory: "yes" } },
    { name: "driving history discuss", data: { drivingHistory: "discuss" } },
    { name: "additional driver requested", data: { additionalDriver: "yes" } },
    { name: "income source other", data: { incomeSource: "other" } },
    { name: "missing required information", data: { urgency: "" } },
    { name: "notes needing clarification", data: { notes: "Not sure about the return date yet" } },
    {
      name: "notes contradicting the form",
      data: { additionalDriver: "no", notes: "My wife will also drive sometimes" },
    },
  ];

  for (const c of cases) {
    it(`never high priority: ${c.name}`, () => {
      const r = qualifyLead(excellent(c.data), economyVehicle);
      expect(r.hardRejected).toBe(false);
      expect(r.status).not.toBe("high-priority");
      expect(r.tier).not.toBe("excellent");
      expect(r.manualReviewReasons.length).toBeGreaterThan(0);
    });
  }

  it("flags missing info with the missing-info status", () => {
    const r = qualifyLead(excellent({ incomeSource: "" }), economyVehicle);
    expect(r.status).toBe("missing-info");
    expect(r.missingInfo).toContain("Income source");
  });

  it("flags a premium request under the day minimum for review", () => {
    const r = qualifyLead(
      excellent({
        vehicleCategory: "premium",
        vehicleId: premiumVehicle.id,
        pickupDate: "2026-09-01",
        returnDate: "2026-09-02",
      }),
      premiumVehicle,
    );
    expect(r.status).toBe("needs-review");
    expect(r.riskFlags.join(" ")).toContain(`${PREMIUM_SUV_MIN_DAYS}-day minimum`);
  });
});

describe("score and status boundaries", () => {
  it("caps the score at 100 and floors it at 0", () => {
    expect(clampScore(180)).toBe(100);
    expect(clampScore(-40)).toBe(0);
    expect(clampScore(87.4)).toBe(87);
  });

  it("maps score bands to tiers", () => {
    expect(tierForScore(100)).toBe("excellent");
    expect(tierForScore(90)).toBe("excellent");
    expect(tierForScore(89)).toBe("good");
    expect(tierForScore(75)).toBe("good");
    expect(tierForScore(74)).toBe("manual-review");
    expect(tierForScore(60)).toBe("manual-review");
    expect(tierForScore(59)).toBe("low-quality");
    expect(tierForScore(0)).toBe("low-quality");
  });

  it("never returns a score above 100 for a maximal lead", () => {
    const r = qualifyLead(excellent(), premiumVehicle);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("an empty lead is missing-info, low quality, and not high priority", () => {
    const r = qualifyLead({ ...emptyLead }, null);
    expect(r.status).toBe("missing-info");
    expect(r.tier).toBe("low-quality");
    expect(r.score).toBeLessThan(60);
    expect(r.missingInfo.length).toBeGreaterThan(5);
  });
});
