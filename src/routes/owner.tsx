import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, LogOut, RefreshCw, ClipboardList } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/royalty-luxury-logo.png.asset.json";

export const Route = createFileRoute("/owner")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Owner Portal — Royalty Luxury Transportation Services" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: "Private owner portal for reviewing submitted rental leads.",
      },
      { property: "og:title", content: "Owner Portal — Royalty Luxury Transportation Services" },
      { property: "og:description", content: "Private owner portal for rental leads." },
    ],
  }),
  component: OwnerPortal,
});

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "reserved", label: "Reserved" },
  { value: "completed", label: "Completed" },
  { value: "lost", label: "Lost" },
] as const;

type Lead = Record<string, any>;

function fmtDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtDateTime(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
const val = (v: any) => (v === null || v === undefined || v === "" ? "—" : String(v));
const yesNo = (v: any) => (v === true ? "Yes" : v === false ? "No" : val(v));

const SETUP_HINT =
  "Owner access isn't configured in the database yet — run supabase/owner-portal.sql in the Supabase SQL Editor to grant the owner read/update access.";

/** Permission / missing-grant errors, as opposed to genuine query failures. */
function isAccessError(err: { code?: string; message?: string } | null) {
  if (!err) return false;
  const code = err.code ?? "";
  const msg = (err.message ?? "").toLowerCase();
  return (
    code === "42501" || // insufficient_privilege (missing GRANT)
    code === "PGRST301" || // JWT / role not permitted
    code === "42P01" || // relation not exposed to this role
    msg.includes("permission denied") ||
    msg.includes("row-level security")
  );
}

function describeError(err: { code?: string; message?: string; hint?: string; details?: string }) {
  const parts = [err.message ?? "Request failed"];
  if (err.code) parts.push(`(code ${err.code})`);
  if (err.hint) parts.push(`Hint: ${err.hint}`);
  else if (err.details) parts.push(err.details);
  const base = parts.join(" ");
  return isAccessError(err) ? `${SETUP_HINT}\n\n${base}` : base;
}


function OwnerPortal() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return session ? <Dashboard /> : <LoginScreen />;
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter both your email and password.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      setError(
        error.message.toLowerCase().includes("invalid login")
          ? "That email and password combination didn't match an owner account."
          : error.message,
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 shadow-xl">
        <img src={logoAsset.url} alt="Royalty Luxury Transportation Services" className="mx-auto h-16 w-auto" />
        <h1 className="mt-6 text-center font-display text-2xl font-semibold text-foreground">
          Owner Portal
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Sign in to review submitted rental leads.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="owner-email">Email</Label>
            <Input
              id="owner-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner-password">Password</Label>
            <Input
              id="owner-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Access is limited to the business owner. Accounts are created by invitation only.
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setBlocked(false);

    const { data, error } = await supabase
      .from("rental_leads")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      setError(describeError(error));
      setBlocked(isAccessError(error));
      setLeads([]);
      setLoading(false);
      return;
    }

    // RLS returns zero rows with no error when the owner has no SELECT policy,
    // which looks identical to an empty table. Probe with an exact count to tell
    // the two apart.
    if ((data ?? []).length === 0) {
      const probe = await supabase
        .from("rental_leads")
        .select("*", { count: "exact", head: true });
      if (probe.error) {
        setError(describeError(probe.error));
        setBlocked(isAccessError(probe.error));
      }
    }

    setLeads(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);


  const selected = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [leads, selectedId],
  );

  const updateStatus = async (id: string, lead_status: string) => {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, lead_status } : l)));
    const { error } = await supabase.from("rental_leads").update({ lead_status }).eq("id", id);
    if (error) {
      setLeads(prev);
      setError(describeError(error));

    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="" className="h-9 w-auto" />
            <span className="hidden font-display text-sm font-semibold text-foreground sm:inline">
              Owner Portal
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-medium text-gold">
              <ClipboardList className="h-3.5 w-3.5" /> Leads
            </span>
            <Button variant="ghost" size="sm" onClick={load} aria-label="Refresh leads">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-1.5 h-4 w-4" /> Log out
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {error && (
          <p role="alert" className="mb-4 whitespace-pre-line rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {selected ? (
          <LeadDetail
            lead={selected}
            onBack={() => setSelectedId(null)}
            onStatusChange={(s) => updateStatus(selected.id, s)}
          />
        ) : (
          <LeadList
            leads={leads}
            loading={loading}
            blocked={blocked}
            onOpen={setSelectedId}
            onStatusChange={updateStatus}
          />
        )}

      </main>
    </div>
  );
}

function StatusSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <Select value={value || "new"} onValueChange={onChange}>
      <SelectTrigger className={cn("h-8 w-[150px] text-xs", className)} onClick={(e) => e.stopPropagation()}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function LeadList({
  leads,
  loading,
  blocked,
  onOpen,
  onStatusChange,
}: {
  leads: Lead[];
  loading: boolean;
  blocked?: boolean;
  onOpen: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : blocked
                ? "Unable to read leads"
                : `${leads.length} submission${leads.length === 1 ? "" : "s"}, newest first`}
          </p>
        </div>
      </div>

      {!loading && leads.length === 0 && (
        <div className="rounded-lg border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
          {blocked ? (
            <>
              <p className="font-medium text-foreground">Owner access isn't configured yet</p>
              <p className="mx-auto mt-2 max-w-md">
                The database is blocking reads for your account. Run{" "}
                <code className="rounded bg-accent px-1 py-0.5 text-xs">supabase/owner-portal.sql</code>{" "}
                in the Supabase SQL Editor, then refresh.
              </p>
            </>
          ) : (
            "No leads yet."
          )}
        </div>
      )}


      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {leads.map((l) => (
          <button
            key={l.id}
            onClick={() => onOpen(l.id)}
            className="block w-full rounded-lg border border-border/60 bg-card p-4 text-left transition-colors hover:border-gold/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{val(l.full_name)}</p>
                <p className="text-xs text-muted-foreground">{val(l.phone)} · {val(l.email)}</p>
              </div>
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] capitalize text-accent-foreground">
                {val(l.lead_status)}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div><dt className="inline">Vehicle: </dt><dd className="inline text-foreground">{val(l.vehicle_name ?? l.vehicle_category)}</dd></div>
              <div><dt className="inline">Submitted: </dt><dd className="inline text-foreground">{fmtDate(l.submitted_at)}</dd></div>
              <div><dt className="inline">Pickup: </dt><dd className="inline text-foreground">{fmtDate(l.pickup_date)}</dd></div>
              <div><dt className="inline">Return: </dt><dd className="inline text-foreground">{fmtDate(l.return_date)}</dd></div>
            </dl>
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-border/60 bg-card md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Pickup</th>
              <th className="px-4 py-3 font-medium">Return</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr
                key={l.id}
                onClick={() => onOpen(l.id)}
                className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-accent/40"
              >
                <td className="px-4 py-3 font-medium text-foreground">{val(l.full_name)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div>{val(l.phone)}</div>
                  <div className="text-xs">{val(l.email)}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{val(l.vehicle_name ?? l.vehicle_category)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(l.pickup_date)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(l.return_date)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(l.submitted_at)}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <StatusSelect value={l.lead_status} onChange={(s) => onStatusChange(l.id, s)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-foreground">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border/60 bg-card p-5">
      <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>
    </section>
  );
}

function LeadDetail({
  lead,
  onBack,
  onStatusChange,
}: {
  lead: Lead;
  onBack: () => void;
  onStatusChange: (status: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to leads
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <StatusSelect value={lead.lead_status} onChange={onStatusChange} />
        </div>
      </div>

      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">{val(lead.full_name)}</h1>
        <p className="text-sm text-muted-foreground">
          Submission {val(lead.submission_id)} · {fmtDateTime(lead.submitted_at)}
        </p>
      </div>

      <Section title="Contact information">
        <Field label="Full name" value={val(lead.full_name)} />
        <Field label="Phone" value={<a className="hover:text-gold" href={`tel:${lead.phone}`}>{val(lead.phone)}</a>} />
        <Field label="Email" value={<a className="hover:text-gold" href={`mailto:${lead.email}`}>{val(lead.email)}</a>} />
        <Field label="Preferred contact method" value={val(lead.contact_method)} />
      </Section>

      <Section title="Rental request">
        <Field label="Vehicle" value={val(lead.vehicle_name)} />
        <Field label="Category" value={val(lead.vehicle_category)} />
        <Field label="Vehicle ID" value={val(lead.vehicle_id)} />
        <Field label="Pickup" value={`${fmtDate(lead.pickup_date)} · ${val(lead.pickup_time)}`} />
        <Field label="Return" value={`${fmtDate(lead.return_date)} · ${val(lead.return_time)}`} />
        <Field label="Duration" value={lead.rental_duration_days ? `${lead.rental_duration_days} days` : "—"} />
        <Field label="Pickup preference" value={val(lead.pickup_preference)} />
        <Field label="Pickup area" value={val(lead.pickup_area)} />
        <Field label="Purpose" value={val(lead.rental_purpose)} />
      </Section>

      <Section title="Qualification answers">
        <Field label="Meets minimum age" value={val(lead.meets_age)} />
        <Field label="Valid license" value={val(lead.has_license)} />
        <Field label="License suspended/expired" value={val(lead.license_suspended)} />
        <Field label="Has insurance" value={val(lead.has_insurance)} />
        <Field label="Rented before" value={val(lead.rented_before)} />
        <Field label="Driving history (5 yrs)" value={val(lead.driving_history)} />
        <Field label="Will provide documents" value={val(lead.will_provide_docs)} />
        <Field label="Deposit ready" value={val(lead.deposit_ready)} />
        <Field label="Urgency" value={val(lead.urgency)} />
      </Section>

      <Section title="Notes and consent">
        <Field label="Notes" value={val(lead.notes)} />
        <Field label="Understands not a reservation" value={yesNo(lead.consent_not_reservation)} />
        <Field label="Consents to contact" value={yesNo(lead.consent_contact)} />
        <Field label="Confirms info accurate" value={yesNo(lead.consent_accurate)} />
        <Field label="Processing status" value={val(lead.processing_status)} />
        <Field label="Received" value={fmtDateTime(lead.created_at)} />
      </Section>
    </div>
  );
}
