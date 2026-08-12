// Server-only helpers for the Resend test email.
// Kept out of *.functions.ts so the server-fn split transform can't strip them.

export type LeadEmailPayload = {
  submissionId: string;
  submittedAt: string;
  vehicleName: string | null;
  rentalDurationDays: number | null;
  fields: Array<{ label: string; value: string }>;
};

export type QualificationEmailOutcome = "passed" | "not_eligible" | "more_information";

export type QualificationEmailPayload = {
  customerName: string;
  customerEmail: string;
  submissionId: string;
  vehicleName: string | null;
  pickupDate: string;
  returnDate: string;
  outcome: QualificationEmailOutcome;
};

const TEST_RECIPIENT = "abdullahimsaid@live.com";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderLeadEmailHtml(payload: LeadEmailPayload): string {
  const rows = payload.fields
    .map(
      (f) => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555;font-size:13px;white-space:nowrap;">${escapeHtml(f.label)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111;font-size:14px;">${escapeHtml(f.value || "—")}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <h1 style="margin:0 0 4px;font-size:20px;color:#111;">New rental request</h1>
    <p style="margin:0 0 16px;color:#666;font-size:13px;">
      Royalty Luxury Transportation Services · ${escapeHtml(payload.submissionId)} · ${escapeHtml(payload.submittedAt)}
    </p>
    <p style="margin:0 0 16px;color:#111;font-size:14px;">
      <strong>Vehicle:</strong> ${escapeHtml(payload.vehicleName ?? "Not specified")}${
        payload.rentalDurationDays ? ` · ${payload.rentalDurationDays} day(s)` : ""
      }
    </p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #eee;">${rows}</table>
  </div>
</body></html>`;
}

export async function sendLeadEmailViaResend(payload: LeadEmailPayload) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY is not configured" };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      // onboarding@resend.dev only delivers to the Resend account owner — fine for testing.
      from: "Royalty Luxury <onboarding@resend.dev>",
      to: [TEST_RECIPIENT],
      subject: `New rental request — ${payload.submissionId}`,
      html: renderLeadEmailHtml(payload),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Resend send failed [${response.status}]: ${body}`);
    return { sent: false, reason: `Resend error ${response.status}: ${body}` };
  }

  return { sent: true };
}

const CUSTOMER_MESSAGES: Record<
  QualificationEmailOutcome,
  { eyebrow: string; heading: string; body: string; nextStep: string }
> = {
  passed: {
    eyebrow: "Ready for the next step",
    heading: "Your request passed our initial eligibility review.",
    body: "Your answers meet the basic requirements for the requested rental. This is not a reservation or final approval, and vehicle availability still needs to be confirmed.",
    nextStep:
      "A member of the rental team will contact you to confirm availability, pricing, deposit details, and required documents.",
  },
  not_eligible: {
    eyebrow: "Rental request update",
    heading: "We cannot move this request forward at this time.",
    body: "Based on the information submitted, one or more basic rental eligibility requirements were not met. No reservation has been created.",
    nextStep:
      "If you believe an answer was entered incorrectly, contact the rental team and reference the request number below.",
  },
  more_information: {
    eyebrow: "More information needed",
    heading: "Your request needs a quick manual review.",
    body: "We received your rental request, but the team needs to verify or clarify some information before determining the next step. No reservation has been created yet.",
    nextStep: "A member of the rental team will contact you using your preferred contact method.",
  },
};

export function renderQualificationEmailHtml(payload: QualificationEmailPayload): string {
  const message = CUSTOMER_MESSAGES[payload.outcome];
  return `<!doctype html>
<html><body style="margin:0;background:#0b0d10;font-family:Arial,Helvetica,sans-serif;color:#f4f4f5;">
  <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
    <div style="border:1px solid #34302a;border-radius:14px;background:#15181d;padding:28px;">
      <p style="margin:0 0 10px;color:#d9a928;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">${escapeHtml(message.eyebrow)}</p>
      <h1 style="margin:0 0 18px;font-size:25px;line-height:1.25;color:#ffffff;">${escapeHtml(message.heading)}</h1>
      <p style="margin:0 0 14px;color:#d4d4d8;font-size:15px;line-height:1.6;">Hello ${escapeHtml(payload.customerName)},</p>
      <p style="margin:0 0 14px;color:#d4d4d8;font-size:15px;line-height:1.6;">${escapeHtml(message.body)}</p>
      <p style="margin:0 0 22px;color:#d4d4d8;font-size:15px;line-height:1.6;">${escapeHtml(message.nextStep)}</p>
      <div style="border:1px solid #2c3037;border-radius:10px;background:#0f1115;padding:16px;">
        <p style="margin:0 0 8px;color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Request details</p>
        <p style="margin:4px 0;color:#ffffff;font-size:14px;"><strong>Reference:</strong> ${escapeHtml(payload.submissionId)}</p>
        <p style="margin:4px 0;color:#ffffff;font-size:14px;"><strong>Vehicle:</strong> ${escapeHtml(payload.vehicleName ?? "Not specified")}</p>
        <p style="margin:4px 0;color:#ffffff;font-size:14px;"><strong>Dates:</strong> ${escapeHtml(payload.pickupDate)} – ${escapeHtml(payload.returnDate)}</p>
      </div>
      <p style="margin:22px 0 0;color:#8f939b;font-size:12px;line-height:1.5;">Royalty Luxury Transportation Services · This automated review does not guarantee approval, pricing, vehicle availability, or a reservation.</p>
    </div>
  </div>
</body></html>`;
}

export async function sendQualificationEmailViaResend(payload: QualificationEmailPayload) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY is not configured" };

  // DEMO MODE: send every outcome to the verified project-owner inbox, never
  // to form-entered customer addresses. After the client approves the flow and
  // a sending domain is verified, replace this with explicit production
  // delivery using FROM_EMAIL and payload.customerEmail.
  const recipient = TEST_RECIPIENT;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "Royalty Luxury <onboarding@resend.dev>",
      to: [recipient],
      subject: `[Customer email preview] ${CUSTOMER_MESSAGES[payload.outcome].eyebrow} — ${payload.submissionId} — intended for ${payload.customerEmail}`,
      html: renderQualificationEmailHtml(payload),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { sent: false, reason: `Resend error ${response.status}: ${body}` };
  }
  return { sent: true, preview: true };
}
