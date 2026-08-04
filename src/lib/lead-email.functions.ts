import { createServerFn } from "@tanstack/react-start";

import type { LeadEmailPayload } from "./lead-email.server";

export const sendLeadTestEmail = createServerFn({ method: "POST" })
  .inputValidator((data: LeadEmailPayload) => data)
  .handler(async ({ data }) => {
    const { sendLeadEmailViaResend } = await import("./lead-email.server");
    return sendLeadEmailViaResend(data);
  });
