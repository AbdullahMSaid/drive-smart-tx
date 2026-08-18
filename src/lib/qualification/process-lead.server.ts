import { createClient } from "@supabase/supabase-js";

import { vehicles } from "@/data/vehicles";
import {
  sendQualificationEmailViaResend,
  type QualificationEmailOutcome,
} from "@/lib/lead-email.server";
import { qualifyLead, type LeadFormData, type QualifiedLead } from "./engine";
import { aiFailureFallback, type ProtectedAiReview } from "./ai-review";
import { reviewLeadWithOpenRouter, type AiReviewRun } from "./ai-review.server";

type DbRow = Record<string, unknown>;

export interface ProcessLeadResult {
  lead: QualifiedLead;
  aiReview: ProtectedAiReview;
  aiAvailable: boolean;
}

function adminClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Server-side Supabase configuration is incomplete");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function string(row: DbRow, key: string): string {
  const value = row[key];
  return value == null ? "" : String(value);
}

function boolean(row: DbRow, key: string): boolean {
  return row[key] === true;
}

/**
 * The insurance question became three-way ("yes" / "no" / "need-provided").
 * Rows captured by the earlier form can hold "unsure", which no longer maps to
 * an answer — return it as unanswered so the lead routes to manual review and
 * the owner re-asks, rather than silently reinterpreting the customer.
 */
function normalizeInsurance(value: string): LeadFormData["hasInsurance"] {
  return value === "yes" || value === "no" || value === "need-provided" ? value : "";
}

function rowToLeadData(row: DbRow): LeadFormData {
  return {
    fullName: string(row, "full_name"),
    phone: string(row, "phone"),
    email: string(row, "email"),
    contactMethod: string(row, "contact_method") as LeadFormData["contactMethod"],
    vehicleId: string(row, "vehicle_id"),
    vehicleCategory: string(row, "vehicle_category") as LeadFormData["vehicleCategory"],
    pickupDate: string(row, "pickup_date"),
    pickupTime: string(row, "pickup_time"),
    returnDate: string(row, "return_date"),
    returnTime: string(row, "return_time"),
    pickupPreference: string(row, "pickup_preference") as LeadFormData["pickupPreference"],
    rentalPurpose: string(row, "rental_purpose"),
    pickupArea: string(row, "pickup_area"),
    notes: string(row, "notes"),
    age: string(row, "age"),
    hasLicense: string(row, "has_license") as LeadFormData["hasLicense"],
    hasInsurance: normalizeInsurance(string(row, "has_insurance")),
    drivingHistory: string(row, "driving_history") as LeadFormData["drivingHistory"],
    proofOfIncome: string(row, "proof_of_income") as LeadFormData["proofOfIncome"],
    willProvideDocs: string(row, "will_provide_docs") as LeadFormData["willProvideDocs"],
    urgency: string(row, "urgency") as LeadFormData["urgency"],
    consentNotReservation: boolean(row, "consent_not_reservation"),
    consentContact: boolean(row, "consent_contact"),
    consentAccurate: boolean(row, "consent_accurate"),
  };
}

async function event(
  supabase: ReturnType<typeof adminClient>,
  leadId: string,
  stepName: string,
  status: "ok" | "error" | "retry",
  message?: string,
) {
  const { error } = await supabase.from("processing_events").insert({
    lead_id: leadId,
    step_name: stepName,
    status,
    message: message?.slice(0, 1000) ?? null,
  });
  if (error) console.warn("[processing event]", error.message);
}

function resultRow(lead: QualifiedLead) {
  return {
    lead_id: lead.leadId,
    rule_status: lead.status,
    rule_score: lead.score,
    rule_positive_signals: lead.positiveSignals,
    rule_risk_flags: lead.riskFlags,
    rule_missing_info: lead.missingInfo,
    rule_recommended_action: lead.recommendedNextAction,
    rule_summary: lead.summary,
  };
}

function aiRow(run: AiReviewRun) {
  return {
    ai_priority: run.review.priority,
    ai_summary: run.review.summary,
    ai_inconsistencies: run.review.inconsistencies,
    ai_additional_risk_flags: run.review.additionalRiskFlags,
    ai_missing_information: run.review.missingInformation,
    ai_recommended_action: run.review.recommendedAction,
    ai_suggested_customer_reply: run.review.suggestedCustomerReply,
    final_status: run.review.finalStatus,
    decision_reason: run.review.decisionReason,
    model_name: run.modelName,
    prompt_version: run.promptVersion,
    input_tokens: run.inputTokens,
    output_tokens: run.outputTokens,
    estimated_ai_cost: run.estimatedCost,
  };
}

async function runPipeline(leadId: string): Promise<ProcessLeadResult> {
  const supabase = adminClient();
  await supabase.from("rental_leads").update({ processing_status: "processing" }).eq("id", leadId);
  await event(supabase, leadId, "pipeline_started", "ok");

  const { data: row, error: fetchError } = await supabase
    .from("rental_leads")
    .select("*")
    .eq("id", leadId)
    .single();
  if (fetchError || !row) throw new Error(fetchError?.message ?? "Saved lead was not found");

  const data = rowToLeadData(row);
  const vehicle = vehicles.find((candidate) => candidate.id === data.vehicleId) ?? null;
  const calculated = qualifyLead(data, vehicle);
  const lead: QualifiedLead = {
    ...calculated,
    leadId,
    submissionId: string(row, "submission_id"),
    submittedAt: string(row, "submitted_at"),
  };

  const { data: qualification, error: insertError } = await supabase
    .from("qualification_results")
    .insert(resultRow(lead))
    .select("id")
    .single();
  if (insertError || !qualification)
    throw new Error(insertError?.message ?? "Could not save rules result");
  await event(supabase, leadId, "deterministic_qualification", "ok");

  let aiRun: AiReviewRun;
  let aiAvailable = true;
  try {
    aiRun = await reviewLeadWithOpenRouter(lead);
    await event(supabase, leadId, "ai_review", "ok");
  } catch (error) {
    aiAvailable = false;
    const message = error instanceof Error ? error.message : String(error);
    aiRun = {
      review: aiFailureFallback(lead),
      modelName: process.env["OPENROUTER_MODEL"] ?? "unavailable",
      promptVersion: "rental-lead-review-v1",
      inputTokens: null,
      outputTokens: null,
      estimatedCost: null,
    };
    await event(supabase, leadId, "ai_review", "error", message);
  }

  const { error: updateError } = await supabase
    .from("qualification_results")
    .update(aiRow(aiRun))
    .eq("id", qualification.id);
  if (updateError) throw new Error(updateError.message);

  const processingStatus =
    aiRun.review.finalStatus === "manual_review" ? "manual_review" : "qualified";
  const { error: statusError } = await supabase
    .from("rental_leads")
    .update({ processing_status: processingStatus })
    .eq("id", leadId);
  if (statusError) throw new Error(statusError.message);
  await event(supabase, leadId, "pipeline_completed", "ok", aiRun.review.finalStatus);

  const emailOutcome: QualificationEmailOutcome =
    aiRun.review.finalStatus === "not_eligible"
      ? "not_eligible"
      : aiRun.review.finalStatus === "high" || aiRun.review.finalStatus === "normal"
        ? "passed"
        : "more_information";
  try {
    const email = await sendQualificationEmailViaResend({
      customerName: lead.data.fullName,
      customerEmail: lead.data.email,
      submissionId: lead.submissionId,
      vehicleName: lead.vehicleName,
      pickupDate: lead.data.pickupDate,
      returnDate: lead.data.returnDate,
      outcome: emailOutcome,
    });
    await event(
      supabase,
      leadId,
      "customer_result_email",
      email.sent ? "ok" : "error",
      email.sent ? emailOutcome : "reason" in email ? email.reason : "Email was not sent",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await event(supabase, leadId, "customer_result_email", "error", message);
  }

  return { lead, aiReview: aiRun.review, aiAvailable };
}

export async function processSavedLead(leadId: string): Promise<ProcessLeadResult> {
  try {
    return await runPipeline(leadId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      const supabase = adminClient();
      await supabase.from("rental_leads").update({ processing_status: "error" }).eq("id", leadId);
      await event(supabase, leadId, "pipeline_failed", "error", message);
    } catch (auditError) {
      console.error("[qualification pipeline audit failed]", auditError);
    }
    throw error;
  }
}
