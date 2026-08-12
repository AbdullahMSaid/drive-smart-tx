import { ChatOpenRouter } from "@langchain/openrouter";

import type { QualifiedLead } from "./engine";
import {
  AI_REVIEW_PROMPT_VERSION,
  aiReviewSchema,
  buildAiReviewMessages,
  protectAiDecision,
  type ProtectedAiReview,
} from "./ai-review";

export interface AiReviewRun {
  review: ProtectedAiReview;
  modelName: string;
  promptVersion: string;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCost: number | null;
}

export async function reviewLeadWithOpenRouter(lead: QualifiedLead): Promise<AiReviewRun> {
  const apiKey = process.env["OPENROUTER_API_KEY"];
  const modelName = process.env["OPENROUTER_MODEL"];
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");
  if (!modelName) throw new Error("OPENROUTER_MODEL is not configured");

  const model = new ChatOpenRouter({
    apiKey,
    model: modelName,
    temperature: 0,
    maxRetries: 1,
  });
  const structured = model.withStructuredOutput(aiReviewSchema, {
    name: "rental_lead_review",
    // DeepSeek V4 Flash exposes structured data through tool/function calling
    // in LangChain's OpenRouter adapter. Zod still validates the parsed result.
    method: "functionCalling",
    includeRaw: true,
  });
  const result = await structured.invoke(buildAiReviewMessages(lead));
  if (!result.parsed) throw new Error("OpenRouter returned no validated structured output");

  const usage = result.raw.usage_metadata;
  return {
    review: protectAiDecision(lead, result.parsed),
    modelName,
    promptVersion: AI_REVIEW_PROMPT_VERSION,
    inputTokens: usage?.input_tokens ?? null,
    outputTokens: usage?.output_tokens ?? null,
    estimatedCost: null,
  };
}
