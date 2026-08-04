import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ArrowRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle, ClipboardCheck, Sparkles, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SectionHeading } from "./SectionHeading";
import { RentalEstimator } from "./RentalEstimator";
import { vehicles, PREMIUM_SUV_MIN_DAYS, MIN_RENTAL_AGE_PLACEHOLDER } from "@/data/vehicles";
import { estimateRental, getVehiclePricing } from "@/data/pricing";
import {
  emptyLead,
  calcDurationDays,
  qualifyLead,
  saveLead,
  runAiLeadQualification,
  INCOME_SOURCE_LABELS,
  
  type LeadFormData,
  type QualifiedLead,
} from "@/lib/lead-qualification";

import { cn } from "@/lib/utils";

const PURPOSES = [
  "Everyday transportation",
  "Work or commuting",
  "Rideshare or delivery",
  "Family vacation",
  "Road trip",
  "Airport transportation",
  "Business travel",
  "Birthday or celebration",
  "Anniversary or romantic trip",
  "Other",
];

const STEPS = ["Contact", "Rental", "Qualification", "Review"] as const;

export function LeadForm({
  preselectedVehicleId,
  onPreselectHandled,
}: {
  preselectedVehicleId: string | null;
  onPreselectHandled: () => void;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<LeadFormData>(emptyLead);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QualifiedLead | null>(null);
  const pickupDateRef = useRef<HTMLInputElement | null>(null);

  // Handle preselection from vehicle cards
  useEffect(() => {
    if (!preselectedVehicleId) return;
    const v = vehicles.find((x) => x.id === preselectedVehicleId);
    if (!v) return;
    const category: LeadFormData["vehicleCategory"] =
      v.category === "economy" || v.category === "premium" ? v.category : "unsure";
    setData((d) => ({
      ...d,
      vehicleId: v.id,
      vehicleCategory: category,
    }));
    setResult(null);
    setStep(1);
    onPreselectHandled();
    // Focus the pickup-date field after the rental step renders
    requestAnimationFrame(() => {
      setTimeout(() => pickupDateRef.current?.focus(), 60);
    });
  }, [preselectedVehicleId, onPreselectHandled]);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === data.vehicleId) ?? null,
    [data.vehicleId],
  );
  const duration = calcDurationDays(data.pickupDate, data.returnDate);
  const isPremium =
    (selectedVehicle?.category ?? data.vehicleCategory) === "premium";
  const hasPricingConfig = !!data.vehicleId && !!getVehiclePricing(data.vehicleId);
  // When a specific vehicle with pricing config is selected, the RentalEstimator
  // enforces the vehicle-specific minimum (which counts calendar days inclusively).
  // Only fall back to the generic premium-category minimum when no priced vehicle is chosen.
  const premiumDurationInvalid =
    isPremium && !hasPricingConfig && duration !== null && duration < PREMIUM_SUV_MIN_DAYS;

  function update<K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!data.fullName.trim()) return "Please enter your full name.";
      if (!/^[+\d\s().-]{7,}$/.test(data.phone)) return "Please enter a valid phone number.";
      if (!/^\S+@\S+\.\S+$/.test(data.email)) return "Please enter a valid email address.";
    }
    if (s === 1) {
      if (!data.pickupDate || !data.returnDate) return "Please choose pickup and return dates.";
      if (!data.pickupTime || !data.returnTime) return "Please choose pickup and return times.";
      if (duration === null) return "Return date must be on or after pickup date.";
      if (premiumDurationInvalid) return `Premium SUV rentals require a minimum of ${PREMIUM_SUV_MIN_DAYS} days.`;
      if (data.vehicleId) {
        const est = estimateRental(data.vehicleId, data.pickupDate, data.returnDate);
        if (est && !est.meetsMinimum) {
          return `This vehicle requires a minimum ${est.minimumDays}-day rental.`;
        }
      }
      if (!data.rentalPurpose) return "Please choose a rental purpose.";
    }
    if (s === 2) {
      const ageNum = Number.parseInt(data.age, 10);
      if (!data.age.trim() || Number.isNaN(ageNum)) return "Please enter your age.";
      if (ageNum < 15 || ageNum > 100) return "Please enter a valid age.";
      if (ageNum < MIN_RENTAL_AGE_PLACEHOLDER) return `Renters must be at least ${MIN_RENTAL_AGE_PLACEHOLDER} years old.`;
      const req: (keyof LeadFormData)[] = [
        "hasLicense","licenseSuspended","hasInsurance",
        "rentedBefore","drivingHistory","incomeSource","proofOfIncome",
        "firstWeekPayment","additionalDriver","agreesToAgreement",
        "willProvideDocs","depositReady","urgency",
      ];
      for (const k of req) if (!data[k]) return "Please answer every qualification question.";
    }

    if (s === 3) {
      if (!data.consentNotReservation || !data.consentContact || !data.consentAccurate)
        return "Please confirm all three consent checkboxes.";
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() { setError(null); setStep((s) => Math.max(0, s - 1)); }

  async function submit() {
    const err = validateStep(3);
    if (err) { setError(err); return; }
    setSubmitting(true);
    setError(null);
    try {
      const initial = qualifyLead(data, selectedVehicle);
      await saveLead(initial);
      const enriched = await runAiLeadQualification(initial);
      setResult(enriched);
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      // Full detail goes to the console for debugging; the visitor sees a
      // friendly message plus the phone number so a failure never loses a lead.
      console.error("[lead submit] failed:", detail, e);
      setError(
        "We couldn't submit your request. Please try again, or call (614) 359-1370 and we'll take your details directly.",
      );
    } finally {

      setSubmitting(false);
    }
  }

  function reset() {
    setData(emptyLead);
    setStep(0);
    setResult(null);
    setError(null);
  }

  return (
    <section id="lead-form" className="section-y scroll-mt-32 bg-background">
      <div className="container-x">
        <SectionHeading
          eyebrow="Check availability"
          title="Check availability and get pre-qualified."
          subtitle="Answer a few questions about your rental needs so our team can quickly review your dates, vehicle preference, and basic eligibility."
        />

        <div className="mt-12 mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            {result ? (
              <ConfirmationView result={result} onReset={reset} />
            ) : (
              <>
                <StepIndicator step={step} />
                <div className="mt-8">
                  {step === 0 && <ContactStep data={data} update={update} />}
                  {step === 1 && (
                    <RentalStep
                      data={data} update={update} duration={duration}
                      isPremium={isPremium} premiumDurationInvalid={premiumDurationInvalid}
                      pickupDateRef={pickupDateRef}
                    />
                  )}
                  {step === 2 && <QualStep data={data} update={update} />}
                  {step === 3 && <ReviewStep data={data} update={update} duration={duration} />}
                </div>

                {error && (
                  <div className="mt-5 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between gap-3">
                  <Button
                    variant="ghost" onClick={back} disabled={step === 0 || submitting}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                  {step < STEPS.length - 1 ? (
                    <Button onClick={next} className="bg-gold text-gold-foreground hover:bg-gold/90">
                      Continue <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={submit} disabled={submitting}
                      className="bg-gold text-gold-foreground hover:bg-gold/90"
                    >
                      {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>) : "Request This Rental"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AssistantPanel() {
  return (
    <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-card via-card to-background p-7 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-gold text-gold-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold">Assistant</div>
            <div className="font-display text-lg font-semibold text-card-foreground">Lead Qualification AI</div>
          </div>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          A guided rental assistant — not a chatbot. It walks you through a short set of questions,
          organizes your answers, and hands them to the rental team for a faster response.
        </p>
        <div className="mt-6 space-y-3">
          <Benefit icon={ClipboardCheck} title="Checks basic rental fit" body="Age, license, insurance, and deposit readiness." />
          <Benefit icon={ListChecks} title="Identifies missing information" body="Flags what's still needed before pricing." />
          <Benefit icon={Sparkles} title="Helps the rental team respond faster" body="Summarizes your request in a clean, review-ready format." />
        </div>
        <div className="mt-6 rounded-lg border border-border bg-background/50 p-3 text-xs text-muted-foreground">
          Your answers are only used to review this rental request. Do not submit sensitive information such as Social Security numbers, full driver's-license numbers, or payment-card details.
        </div>
      </div>
    </div>
  );
}

function Benefit({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-md bg-gold/15 text-gold shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-medium text-card-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1">
          <div className={cn(
            "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold shrink-0",
            i < step && "bg-gold text-gold-foreground",
            i === step && "bg-gold text-gold-foreground ring-4 ring-gold/20",
            i > step && "bg-secondary text-muted-foreground",
          )}>
            {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          <span className={cn("hidden sm:inline text-xs font-medium", i === step ? "text-foreground" : "text-muted-foreground")}>
            {label}
          </span>
          {i < STEPS.length - 1 && <div className={cn("h-px flex-1", i < step ? "bg-gold" : "bg-border")} />}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Steps ---------------- */

function ContactStep({ data, update }: { data: LeadFormData; update: <K extends keyof LeadFormData>(k: K, v: LeadFormData[K]) => void }) {
  return (
    <div className="space-y-5 rise-in">
      <StepHeader n="01" title="Contact information" desc="How can the rental team reach you?" />
      <Field label="Full name">
        <Input value={data.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Doe" maxLength={80} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone number">
          <Input type="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(555) 555-1234" maxLength={20} />
        </Field>
        <Field label="Email address">
          <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" maxLength={120} />
        </Field>
      </div>
      <Field label="Preferred contact method">
        <RadioGroup value={data.contactMethod} onValueChange={(v) => update("contactMethod", v as LeadFormData["contactMethod"])} className="grid grid-cols-3 gap-2">
          {(["phone","text","email"] as const).map((m) => (
            <label key={m} className={cn(
              "flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm capitalize transition",
              data.contactMethod === m ? "border-gold bg-gold/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}>
              <RadioGroupItem value={m} className="sr-only" />
              {m === "text" ? "Text message" : m === "phone" ? "Phone call" : "Email"}
            </label>
          ))}
        </RadioGroup>
      </Field>
    </div>
  );
}

function RentalStep({
  data, update, duration, isPremium, premiumDurationInvalid, pickupDateRef,
}: {
  data: LeadFormData;
  update: <K extends keyof LeadFormData>(k: K, v: LeadFormData[K]) => void;
  duration: number | null;
  isPremium: boolean;
  premiumDurationInvalid: boolean;
  pickupDateRef: React.RefObject<HTMLInputElement | null>;
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="space-y-5 rise-in">
      <StepHeader n="02" title="Rental request" desc="Tell us about the vehicle, dates, and how you'd like to receive it." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Desired vehicle">
          <Select value={data.vehicleId || "any"} onValueChange={(v) => {
            if (v === "any") { update("vehicleId", ""); return; }
            update("vehicleId", v);
            const veh = vehicles.find((x) => x.id === v);
            if (veh && (veh.category === "economy" || veh.category === "premium")) {
              update("vehicleCategory", veh.category);
            }
          }}>
            <SelectTrigger><SelectValue placeholder="Choose a vehicle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">No specific vehicle yet</SelectItem>
              {vehicles
                .filter((v) => v.category !== "coming-soon")
                .map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} — {v.subtitle}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Vehicle category">
          <Select value={data.vehicleCategory} onValueChange={(v) => update("vehicleCategory", v as LeadFormData["vehicleCategory"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="unsure">Not sure</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pickup date">
          <Input ref={pickupDateRef} type="date" min={today} value={data.pickupDate} onChange={(e) => update("pickupDate", e.target.value)} />
        </Field>
        <Field label="Pickup time">
          <Input type="time" value={data.pickupTime} onChange={(e) => update("pickupTime", e.target.value)} />
        </Field>
        <Field label="Return date">
          <Input type="date" min={data.pickupDate || today} value={data.returnDate} onChange={(e) => update("returnDate", e.target.value)} />
        </Field>
        <Field label="Return time">
          <Input type="time" value={data.returnTime} onChange={(e) => update("returnTime", e.target.value)} />
        </Field>
      </div>

      <RentalEstimator
        vehicleId={data.vehicleId}
        pickupDate={data.pickupDate}
        returnDate={data.returnDate}
      />

      {duration !== null && (
        <div className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
          Rental duration: <span className="text-foreground font-medium">{duration} day{duration === 1 ? "" : "s"}</span>
        </div>
      )}

      {isPremium && (
        <div className={cn(
          "rounded-md border p-3 text-sm",
          premiumDurationInvalid
            ? "border-destructive/40 bg-destructive/10 text-destructive-foreground"
            : "border-gold/40 bg-gold/10 text-foreground",
        )}>
          Premium Suburban rentals require a minimum rental period of {PREMIUM_SUV_MIN_DAYS} days.
          {premiumDurationInvalid && " Please adjust the return date to continue."}
        </div>
      )}

      <Field label="Pickup or delivery preference">
        <div className="grid grid-cols-2 gap-2">
          {(["pickup", "delivery"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => update("pickupPreference", opt)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition",
                data.pickupPreference === opt
                  ? "border-gold bg-gold/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {opt === "pickup" ? "I'll pick it up" : "Request delivery"}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Rental purpose">
        <Select value={data.rentalPurpose} onValueChange={(v) => update("rentalPurpose", v)}>
          <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
          <SelectContent>
            {PURPOSES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>

      <Field label={data.pickupPreference === "delivery" ? "Delivery address or preferred area" : "Pickup location or preferred service area"}>
        <Input value={data.pickupArea} onChange={(e) => update("pickupArea", e.target.value)} placeholder="City or neighborhood in the DFW area" maxLength={120} />
      </Field>

      <Field label="Additional rental notes (optional)">
        <Textarea rows={3} value={data.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Anything else the rental team should know?" maxLength={800} />
      </Field>
    </div>
  );
}

function QualStep({ data, update }: { data: LeadFormData; update: <K extends keyof LeadFormData>(k: K, v: LeadFormData[K]) => void }) {
  return (
    <div className="space-y-5 rise-in">
      <StepHeader n="03" title="Basic qualification" desc="A few quick questions to help the rental team review your request." />

      <Field label="How old are you?">
        <Input
          type="number"
          inputMode="numeric"
          min={15}
          max={100}
          value={data.age}
          onChange={(e) => update("age", e.target.value.replace(/\D/g, "").slice(0, 3))}
          placeholder="Age in years"
          className="sm:max-w-40"
        />
        <p className="text-xs text-muted-foreground">
          Renters must be at least {MIN_RENTAL_AGE_PLACEHOLDER} years old.
        </p>
      </Field>

      <YN q="Do you have a valid driver's license?" value={data.hasLicense} onChange={(v) => update("hasLicense", v)} />
      <YN q="Is your driver's license currently suspended or expired?" value={data.licenseSuspended} onChange={(v) => update("licenseSuspended", v)} />

      <Field label="Do you currently have automobile insurance?">
        <ButtonGroup
          value={data.hasInsurance}
          onChange={(v) => update("hasInsurance", v as LeadFormData["hasInsurance"])}
          options={[["yes","Yes"],["no","No"],["unsure","Not sure"]]}
        />
      </Field>

      <YN q="Have you rented a vehicle before?" value={data.rentedBefore} onChange={(v) => update("rentedBefore", v)} />

      <Field label="Have you had any major driving violations or serious accidents in the last 5 years?">
        <ButtonGroup
          value={data.drivingHistory}
          onChange={(v) => update("drivingHistory", v as LeadFormData["drivingHistory"])}
          options={[["no","No"],["yes","Yes"],["discuss","Prefer to discuss"]]}
        />
      </Field>

      <Field label="What is your primary source of income?">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(Object.keys(INCOME_SOURCE_LABELS) as (keyof typeof INCOME_SOURCE_LABELS)[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => update("incomeSource", key)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition",
                data.incomeSource === key
                  ? "border-gold bg-gold/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40",
              )}
            >
              {INCOME_SOURCE_LABELS[key]}
            </button>
          ))}
        </div>
      </Field>

      <YN q="Can you provide proof of income from the last 2 months?" value={data.proofOfIncome} onChange={(v) => update("proofOfIncome", v)} />
      <YN q="Can you pay the first week's rental payment today?" value={data.firstWeekPayment} onChange={(v) => update("firstWeekPayment", v)} />

      <Field label="Will anyone else be driving this vehicle?">
        <ButtonGroup
          value={data.additionalDriver}
          onChange={(v) => update("additionalDriver", v as LeadFormData["additionalDriver"])}
          options={[["no","No"],["yes","Yes — approved driver will be added"]]}
        />
      </Field>

      <YN
        q="Do you understand and agree to the rental agreement, mileage limits, payment schedule, and maintenance responsibilities?"
        value={data.agreesToAgreement}
        onChange={(v) => update("agreesToAgreement", v)}
      />


      <YN q="Are you prepared to provide a valid driver's license and proof of insurance before final approval?" value={data.willProvideDocs} onChange={(v) => update("willProvideDocs", v)} />

      <Field label="Are you prepared to pay the required rental deposit if approved?">
        <ButtonGroup
          value={data.depositReady}
          onChange={(v) => update("depositReady", v as LeadFormData["depositReady"])}
          options={[["yes","Yes"],["no","No"],["need-pricing","Need pricing information"]]}
        />
      </Field>

      <Field label="How soon do you need the vehicle?">
        <Select value={data.urgency} onValueChange={(v) => update("urgency", v as LeadFormData["urgency"])}>
          <SelectTrigger><SelectValue placeholder="Select timing" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Immediately</SelectItem>
            <SelectItem value="within-week">Within one week</SelectItem>
            <SelectItem value="within-two-weeks">Within two weeks</SelectItem>
            <SelectItem value="later">More than two weeks from now</SelectItem>
            <SelectItem value="researching">Just researching</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

function ReviewStep({ data, update, duration }: {
  data: LeadFormData;
  update: <K extends keyof LeadFormData>(k: K, v: LeadFormData[K]) => void;
  duration: number | null;
}) {
  const veh = vehicles.find((v) => v.id === data.vehicleId);
  const est = data.vehicleId && data.pickupDate && data.returnDate
    ? estimateRental(data.vehicleId, data.pickupDate, data.returnDate)
    : null;
  const rows: [string, string][] = [
    ["Name", data.fullName || "—"],
    ["Contact", `${data.phone || "—"} · ${data.email || "—"}`],
    ["Preferred contact", data.contactMethod],
    ["Vehicle", veh?.name || (data.vehicleCategory === "unsure" ? "Not sure yet" : data.vehicleCategory)],
    ["Dates", `${data.pickupDate || "—"} ${data.pickupTime || ""} → ${data.returnDate || "—"} ${data.returnTime || ""}${duration ? ` (${duration} day${duration===1?"":"s"})` : ""}`],
    ["Pickup or delivery", data.pickupPreference === "delivery" ? "Delivery requested" : "Customer pickup"],
    ...(est ? ([[
      "Estimated rental price",
      `$${est.baseTotal.toLocaleString("en-US")} (${est.totalDays} day${est.totalDays===1?"":"s"}, estimate only)`,
    ]] as [string, string][]) : []),
    ["Purpose", data.rentalPurpose || "—"],
    ["Pickup area", data.pickupArea || "—"],
    ["Age", data.age ? `${data.age} years old` : "—"],
    ["Valid license", data.hasLicense || "—"],
    ["License suspended/expired", data.licenseSuspended || "—"],
    ["Insurance", data.hasInsurance || "—"],
    ["Rented before", data.rentedBefore || "—"],
    ["Driving history (5y)", data.drivingHistory || "—"],
    ["Income source", data.incomeSource ? INCOME_SOURCE_LABELS[data.incomeSource] : "—"],
    ["Proof of income (2 months)", data.proofOfIncome || "—"],
    ["Can pay first week today", data.firstWeekPayment || "—"],
    ["Additional driver", data.additionalDriver === "yes" ? "Yes — approved driver to be added" : data.additionalDriver || "—"],
    ["Agrees to rental agreement", data.agreesToAgreement || "—"],
    ["Will provide docs", data.willProvideDocs || "—"],
    ["Deposit ready", data.depositReady || "—"],
    ["Urgency", data.urgency || "—"],

  ];
  return (
    <div className="space-y-5 rise-in">
      <StepHeader n="04" title="Review & consent" desc="Please confirm your information before submitting." />
      <div className="overflow-hidden rounded-lg border border-border">
        <dl className="divide-y divide-border text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[42%_1fr] gap-3 px-4 py-2.5">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-foreground break-words">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
        <Consent
          checked={data.consentNotReservation}
          onChange={(c) => update("consentNotReservation", c)}
          label="I understand that submitting this form does not confirm a reservation."
        />
        <Consent
          checked={data.consentContact}
          onChange={(c) => update("consentContact", c)}
          label="I agree to be contacted by phone, text message, or email regarding this rental request."
        />
        <Consent
          checked={data.consentAccurate}
          onChange={(c) => update("consentAccurate", c)}
          label="I confirm that the information I provided is accurate to the best of my knowledge."
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Do not submit Social Security numbers, payment-card details, full driver's-license numbers, or other highly sensitive information through this form.
      </p>
    </div>
  );
}

/* ---------------- Confirmation ---------------- */

function ConfirmationView({ result, onReset }: { result: QualifiedLead; onReset: () => void }) {
  return (
    <div className="rise-in">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-gold text-gold-foreground">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold">Request submitted</div>
          <h3 className="font-display text-2xl font-semibold text-card-foreground">
            Your rental request has been submitted.
          </h3>
        </div>
      </div>
      <p className="mt-4 text-muted-foreground">
        Your information has been organized for review. A member of the rental team will contact
        you regarding vehicle availability, pricing, eligibility, and next steps.
      </p>

      <dl className="mt-6 grid gap-3 rounded-lg border border-border bg-secondary/40 p-4 text-sm sm:grid-cols-2">
        <Row k="Requested vehicle" v={result.vehicleName ?? "Not specified"} />
        <Row k="Requested dates" v={`${result.data.pickupDate} → ${result.data.returnDate}${result.rentalDurationDays ? ` (${result.rentalDurationDays}d)` : ""}`} />
        <Row k="Preferred contact" v={result.data.contactMethod} />
        <Row k="Reference number" v={result.submissionId} />
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          onClick={() => { onReset(); const el = document.getElementById("fleet"); el?.scrollIntoView({ behavior: "smooth" }); }}
          variant="outline"
          className="border-gold/40 hover:bg-gold hover:text-gold-foreground hover:border-gold"
        >
          Return to Vehicles
        </Button>
        <Button onClick={onReset} className="bg-gold text-gold-foreground hover:bg-gold/90">
          Submit Another Request
        </Button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="mt-1 text-foreground break-words">{v}</dd>
    </div>
  );
}

/* ---------------- Small helpers ---------------- */

function StepHeader({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.2em] text-gold">Step {n}</div>
      <h3 className="mt-1 font-display text-xl font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-card-foreground">{label}</Label>
      {children}
    </div>
  );
}

function YN({ q, value, onChange }: { q: string; value: string; onChange: (v: "yes" | "no") => void }) {
  return (
    <Field label={q}>
      <ButtonGroup
        value={value}
        onChange={(v) => onChange(v as "yes" | "no")}
        options={[["yes","Yes"],["no","No"]]}
      />
    </Field>
  );
}

function ButtonGroup({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className={cn("grid gap-2", options.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2")}>
      {options.map(([val, label]) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-medium transition text-left sm:text-center",
            value === val
              ? "border-gold bg-gold/10 text-foreground"
              : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Consent({ checked, onChange, label }: { checked: boolean; onChange: (c: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5" />
      <span className="text-sm text-card-foreground leading-snug">{label}</span>
    </label>
  );
}
