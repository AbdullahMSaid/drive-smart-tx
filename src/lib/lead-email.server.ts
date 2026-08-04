// Server-only helpers for the Resend test email.
// Kept out of *.functions.ts so the server-fn split transform can't strip them.

export type LeadEmailPayload = {
  submissionId: string;
  submittedAt: string;
  vehicleName: string | null;
  rentalDurationDays: number | null;
  fields: Array<{ label: string; value: string }>;
};

const TEST_RECIPIENT = "royaltylux8@gmail.com";

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
