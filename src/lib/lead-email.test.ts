import { describe, expect, it } from "vitest";

import { renderQualificationEmailHtml, type QualificationEmailOutcome } from "./lead-email.server";

function render(outcome: QualificationEmailOutcome) {
  return renderQualificationEmailHtml({
    customerName: "Jordan Test",
    customerEmail: "jordan@example.com",
    submissionId: "LSR-DEMO-001",
    vehicleName: "Honda Accord",
    pickupDate: "2026-09-01",
    returnDate: "2026-09-08",
    outcome,
  });
}

describe("customer qualification emails", () => {
  it("renders the passed-review message without promising approval", () => {
    const html = render("passed");
    expect(html).toContain("passed our initial eligibility review");
    expect(html).toContain("not a reservation or final approval");
  });

  it("renders the not-eligible message", () => {
    expect(render("not_eligible")).toContain("cannot move this request forward");
  });

  it("renders the more-information message", () => {
    expect(render("more_information")).toContain("needs a quick manual review");
  });

  it("escapes customer-controlled content", () => {
    const html = renderQualificationEmailHtml({
      customerName: "<script>alert(1)</script>",
      customerEmail: "test@example.com",
      submissionId: "LSR-XSS",
      vehicleName: "Accord",
      pickupDate: "2026-09-01",
      returnDate: "2026-09-08",
      outcome: "passed",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
