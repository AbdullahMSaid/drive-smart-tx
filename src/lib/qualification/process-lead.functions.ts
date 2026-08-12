import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({ leadId: z.string().uuid() });

export const processLeadOnServer = createServerFn({ method: "POST" })
  .validator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { processSavedLead } = await import("./process-lead.server");
    return processSavedLead(data.leadId);
  });
