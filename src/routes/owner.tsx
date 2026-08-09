import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

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
import logoAsset from "@/assets/royalty-luxury-logo.png";
import { MIN_RENTAL_AGE_PLACEHOLDER } from "@/data/vehicles";
import { tierForScore } from "@/lib/qualification/engine";

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

type Lead = Record<string, unknown>;

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
const val = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : String(v));
const yesNo = (v: unknown) => (v === true ? "Yes" : v === false ? "No" : val(v));

/**
 * The deterministic summary persists the hard-rejection reason today. Keep the
 * portal backward-compatible with existing rows without inventing a new DB
 * column just for presentation.
 */
function hardRejectionReason(summary: unknown): string | null {
  if (typeof summary !== "string") return null;
  const match = summary.match(/Hard rejection:\s*(.+?)\.\s*License:/);
  return match?.[1] ?? null;
}

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
        <img
          src={logoAsset}
          alt="Royalty Luxury Transportation Services"
          className="mx-auto h-16 w-auto"
        />
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
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
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
  const [view, setView] = useState<"dashboard" | "leads">("dashboard");
  // Deterministic (and later AI) qualification output, keyed by lead id.
  // Optional by design: leads submitted before the pipeline runs simply have none.
  const [quals, setQuals] = useState<Record<string, Lead>>({});

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
      const probe = await supabase.from("rental_leads").select("*", { count: "exact", head: true });
      if (probe.error) {
        setError(describeError(probe.error));
        setBlocked(isAccessError(probe.error));
      }
    }

    setLeads(data ?? []);

    const ids = (data ?? []).map((l: Lead) => l.id);
    if (ids.length > 0) {
      const qr = await supabase
        .from("qualification_results")
        .select("*")
        .in("lead_id", ids)
        .order("created_at", { ascending: false });
      const map: Record<string, Lead> = {};
      for (const row of qr.data ?? []) {
        if (!map[row.lead_id]) map[row.lead_id] = row; // newest wins
      }
      setQuals(map);
    } else {
      setQuals({});
    }

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

  const openLead = (id: string) => {
    setSelectedId(id);
    setView("leads");
  };

  const showLeads = () => {
    setSelectedId(null);
    setView("leads");
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border/60 bg-card/50 lg:flex lg:min-h-screen lg:flex-col">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-5">
          <img
            src={logoAsset}
            alt="Royalty Luxury Transportation Services"
            className="h-11 w-auto"
          />
          <span className="font-display text-sm font-semibold leading-tight text-foreground">
            Owner
            <br />
            Dashboard
          </span>
        </div>
        <nav className="space-y-1 px-3 py-5">
          <SidebarButton
            active={view === "dashboard"}
            icon={<LayoutDashboard />}
            onClick={() => {
              setSelectedId(null);
              setView("dashboard");
            }}
          >
            Dashboard
          </SidebarButton>
          <SidebarButton active={view === "leads"} icon={<ClipboardList />} onClick={showLeads}>
            Leads
          </SidebarButton>
        </nav>
        <div className="mt-auto border-t border-border/60 p-4">
          <div className="rounded-xl border border-gold/25 bg-gold/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gold">
              <ShieldCheck className="h-4 w-4" /> Qualification
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Review intake details and protected qualification results in one place.
            </p>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Royalty Luxury TX
            <br />
            <span className="text-foreground">Owner account</span>
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <img src={logoAsset} alt="" className="h-8 w-auto lg:hidden" />
              <div>
                <h1 className="font-display text-lg font-semibold text-foreground">
                  {selected
                    ? "Lead review"
                    : view === "dashboard"
                      ? "Lead qualification"
                      : "All leads"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Rental lead intake and qualification
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={load} aria-label="Refresh leads">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="mr-1.5 h-4 w-4" /> Log out
              </Button>
            </nav>
          </div>
          <div className="flex gap-1 border-t border-border/60 px-3 py-2 lg:hidden">
            <SidebarButton
              active={view === "dashboard"}
              icon={<LayoutDashboard />}
              onClick={() => {
                setSelectedId(null);
                setView("dashboard");
              }}
            >
              Dashboard
            </SidebarButton>
            <SidebarButton active={view === "leads"} icon={<ClipboardList />} onClick={showLeads}>
              Leads
            </SidebarButton>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {error && (
            <p
              role="alert"
              className="mb-4 whitespace-pre-line rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          {selected ? (
            <LeadDetail
              lead={selected}
              qual={quals[selected.id] ?? null}
              onBack={showLeads}
              onStatusChange={(s) => updateStatus(selected.id, s)}
            />
          ) : view === "dashboard" ? (
            <DashboardOverview
              leads={leads}
              quals={quals}
              loading={loading}
              onOpen={openLead}
              onShowLeads={showLeads}
            />
          ) : (
            <LeadList
              leads={leads}
              loading={loading}
              blocked={blocked}
              onOpen={openLead}
              onStatusChange={updateStatus}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarButton({
  active,
  icon,
  children,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-gold/15 text-gold"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {children}
    </button>
  );
}

function DashboardOverview({
  leads,
  quals,
  loading,
  onOpen,
  onShowLeads,
}: {
  leads: Lead[];
  quals: Record<string, Lead>;
  loading: boolean;
  onOpen: (id: string) => void;
  onShowLeads: () => void;
}) {
  const qualificationFor = (lead: Lead) => quals[lead.id];
  const newLeads = leads.filter((lead) => (lead.lead_status || "new") === "new");
  const highPriority = leads.filter(
    (lead) => qualificationFor(lead)?.rule_status === "high-priority",
  );
  const reviewQueue = leads.filter((lead) => {
    const status = qualificationFor(lead)?.rule_status;
    return status === "needs-review" || status === "missing-info";
  });
  const notEligible = leads.filter(
    (lead) => qualificationFor(lead)?.rule_status === "not-eligible",
  );
  const recent = leads.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-gold">Owner overview</p>
          <h2 className="mt-1 font-display text-3xl font-semibold text-foreground">
            Know which leads need you next.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Live totals are based on submitted rental requests and their deterministic qualification
            results.
          </p>
        </div>
        <Button variant="outline" onClick={onShowLeads}>
          View all leads
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="New leads"
          value={newLeads.length}
          icon={<Users />}
          detail="Awaiting owner follow-up"
        />
        <MetricCard
          label="High priority"
          value={highPriority.length}
          icon={<CheckCircle2 />}
          detail="Strong qualification result"
          tone="gold"
        />
        <MetricCard
          label="Needs review"
          value={reviewQueue.length}
          icon={<Clock3 />}
          detail="Check flags or missing details"
          tone="gold"
        />
        <MetricCard
          label="Not eligible"
          value={notEligible.length}
          icon={<XCircle />}
          detail="Hard rule prevented booking"
          tone="danger"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)]">
        <section className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Recent lead activity
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Newest submissions first</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onShowLeads}>
              All leads
            </Button>
          </div>
          {loading ? (
            <p className="p-5 text-sm text-muted-foreground">Loading leads…</p>
          ) : recent.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No leads submitted yet.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {recent.map((lead) => {
                const qual = qualificationFor(lead);
                return (
                  <button
                    key={lead.id}
                    onClick={() => onOpen(lead.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-accent/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {val(lead.full_name)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {val(lead.vehicle_name ?? lead.vehicle_category)} ·{" "}
                        {fmtDate(lead.pickup_date)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <QualificationBadge status={qual?.rule_status} />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {fmtDate(lead.submitted_at)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2 text-gold">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-display text-lg font-semibold text-foreground">Review queue</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Leads that need clarification or an owner decision before availability can be confirmed.
          </p>
          <div className="mt-4 space-y-3">
            {reviewQueue.slice(0, 4).map((lead) => (
              <button
                key={lead.id}
                onClick={() => onOpen(lead.id)}
                className="block w-full rounded-lg border border-border/60 p-3 text-left transition-colors hover:border-gold/40 hover:bg-accent/30"
              >
                <p className="text-sm font-medium text-foreground">{val(lead.full_name)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {val(qualificationFor(lead)?.rule_recommended_action)}
                </p>
              </button>
            ))}
            {!loading && reviewQueue.length === 0 && (
              <p className="rounded-lg bg-accent/40 p-3 text-sm text-muted-foreground">
                No leads currently need manual review.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  detail,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  detail: string;
  tone?: "default" | "gold" | "danger";
}) {
  const iconColor =
    tone === "danger"
      ? "bg-destructive/10 text-destructive"
      : tone === "gold"
        ? "bg-gold/15 text-gold"
        : "bg-accent text-muted-foreground";
  return (
    <section className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-4xl font-semibold text-foreground">{value}</p>
        </div>
        <span className={cn("grid h-10 w-10 place-items-center rounded-full", iconColor)}>
          <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
    </section>
  );
}

function QualificationBadge({ status }: { status?: string }) {
  const label = status ? (QUAL_STATUS_LABELS[status] ?? status) : "Not processed";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-1 text-[11px] font-medium",
        status === "not-eligible"
          ? "bg-destructive/15 text-destructive"
          : status === "high-priority"
            ? "bg-gold/15 text-gold"
            : "bg-accent text-muted-foreground",
      )}
    >
      {label}
    </span>
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
      <SelectTrigger
        className={cn("h-8 w-[150px] text-xs", className)}
        onClick={(e) => e.stopPropagation()}
      >
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
                <code className="rounded bg-accent px-1 py-0.5 text-xs">
                  supabase/owner-portal.sql
                </code>{" "}
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
                <p className="text-xs text-muted-foreground">
                  {val(l.phone)} · {val(l.email)}
                </p>
              </div>
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] capitalize text-accent-foreground">
                {val(l.lead_status)}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <dt className="inline">Vehicle: </dt>
                <dd className="inline text-foreground">
                  {val(l.vehicle_name ?? l.vehicle_category)}
                </dd>
              </div>
              <div>
                <dt className="inline">Submitted: </dt>
                <dd className="inline text-foreground">{fmtDate(l.submitted_at)}</dd>
              </div>
              <div>
                <dt className="inline">Pickup: </dt>
                <dd className="inline text-foreground">{fmtDate(l.pickup_date)}</dd>
              </div>
              <div>
                <dt className="inline">Return: </dt>
                <dd className="inline text-foreground">{fmtDate(l.return_date)}</dd>
              </div>
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
                <td className="px-4 py-3 text-muted-foreground">
                  {val(l.vehicle_name ?? l.vehicle_category)}
                </td>
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

const QUAL_STATUS_LABELS: Record<string, string> = {
  "high-priority": "High priority",
  "needs-review": "Manual review",
  "missing-info": "Missing information",
  "not-eligible": "Not eligible",
};

function BulletList({ items, tone }: { items: unknown; tone: "risk" | "missing" | "positive" }) {
  const list = Array.isArray(items) ? items.filter((i) => typeof i === "string") : [];
  if (list.length === 0) return <span className="text-sm text-muted-foreground">None</span>;
  return (
    <ul className="mt-0.5 space-y-1 text-sm">
      {list.map((item, i) => (
        <li
          key={i}
          className={cn(
            "flex gap-2",
            tone === "risk" && "text-foreground",
            tone === "missing" && "text-muted-foreground",
            tone === "positive" && "text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "mt-1.5 h-1 w-1 shrink-0 rounded-full",
              tone === "risk" ? "bg-destructive" : "bg-gold/70",
            )}
          />
          <span className="break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Qualification result — the protected deterministic status (and, later, the
 * server-side AI review). Renders a neutral placeholder when no result exists
 * yet, so the portal never depends on the pipeline having run.
 */
function QualificationSection({ qual }: { qual?: Lead | null }) {
  if (!qual) {
    return (
      <section className="rounded-lg border border-dashed border-border/60 bg-card/60 p-5">
        <h2 className="font-display text-base font-semibold text-foreground">
          Qualification result
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No qualification result recorded for this lead yet. Scores, risk flags, and the
          recommended action appear here once the review pipeline processes it.
        </p>
      </section>
    );
  }

  const score = typeof qual.rule_score === "number" ? qual.rule_score : null;
  const status = typeof qual.rule_status === "string" ? qual.rule_status : null;
  const hardRejected = status === "not-eligible";
  const rejectionReason = hardRejectionReason(qual.rule_summary);
  const tier = score !== null && status !== "not-eligible" ? tierForScore(score) : null;

  return (
    <section className="rounded-lg border border-border/60 bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-foreground">
          Qualification result
        </h2>
        <div className="flex items-center gap-2">
          {status && (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium",
                status === "not-eligible"
                  ? "bg-destructive/15 text-destructive"
                  : status === "high-priority"
                    ? "bg-gold/15 text-gold"
                    : "bg-accent text-accent-foreground",
              )}
            >
              {QUAL_STATUS_LABELS[status] ?? status}
            </span>
          )}
          {score !== null && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
              {hardRejected ? "Rule score" : "Score"} {score}/100
              {tier ? ` · ${tier.replace("-", " ")}` : ""}
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {hardRejected
          ? "A hard eligibility rule overrides the rule score. The score only reflects the positive signals supplied in the form."
          : "Automatically determined and read-only. The editable status above is the owner's own lead lifecycle stage."}
      </p>

      {hardRejected && (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-foreground">
          <p className="font-medium text-destructive">Hard eligibility rule failed</p>
          <p className="mt-1">
            {rejectionReason ??
              "See the summary and qualification answers for the unmet eligibility requirement."}
          </p>
        </div>
      )}

      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Risk flags</dt>
          <dd>
            <BulletList items={qual.rule_risk_flags} tone="risk" />
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Missing information
          </dt>
          <dd>
            <BulletList items={qual.rule_missing_info} tone="missing" />
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Positive signals
          </dt>
          <dd>
            <BulletList items={qual.rule_positive_signals} tone="positive" />
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Recommended action
          </dt>
          <dd className="mt-0.5 break-words text-sm text-foreground">
            {val(qual.ai_recommended_action ?? qual.rule_recommended_action)}
          </dd>
        </div>
        {(qual.rule_summary || qual.ai_summary) && (
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Summary</dt>
            <dd className="mt-0.5 break-words text-sm text-muted-foreground">
              {val(qual.ai_summary ?? qual.rule_summary)}
            </dd>
          </div>
        )}
      </dl>
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
  qual,
  onBack,
  onStatusChange,
}: {
  lead: Lead;
  qual?: Lead | null;
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
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {val(lead.full_name)}
        </h1>
        <p className="text-sm text-muted-foreground">
          Submission {val(lead.submission_id)} · {fmtDateTime(lead.submitted_at)}
        </p>
      </div>

      <Section title="Contact information">
        <Field label="Full name" value={val(lead.full_name)} />
        <Field
          label="Phone"
          value={
            <a className="hover:text-gold" href={`tel:${lead.phone}`}>
              {val(lead.phone)}
            </a>
          }
        />
        <Field
          label="Email"
          value={
            <a className="hover:text-gold" href={`mailto:${lead.email}`}>
              {val(lead.email)}
            </a>
          }
        />
        <Field label="Preferred contact method" value={val(lead.contact_method)} />
      </Section>

      <Section title="Rental request">
        <Field label="Vehicle" value={val(lead.vehicle_name)} />
        <Field label="Category" value={val(lead.vehicle_category)} />
        <Field label="Vehicle ID" value={val(lead.vehicle_id)} />
        <Field label="Pickup" value={`${fmtDate(lead.pickup_date)} · ${val(lead.pickup_time)}`} />
        <Field label="Return" value={`${fmtDate(lead.return_date)} · ${val(lead.return_time)}`} />
        <Field
          label="Duration"
          value={lead.rental_duration_days ? `${lead.rental_duration_days} days` : "—"}
        />
        <Field label="Pickup preference" value={val(lead.pickup_preference)} />
        <Field label="Pickup area" value={val(lead.pickup_area)} />
        <Field label="Purpose" value={val(lead.rental_purpose)} />
      </Section>

      <QualificationSection qual={qual} />

      <Section title="Qualification answers">
        <Field
          label="Age"
          value={
            lead.age
              ? `${lead.age} years old`
              : val(lead.meets_age === "yes" ? `${MIN_RENTAL_AGE_PLACEHOLDER}+` : lead.meets_age)
          }
        />
        <Field label="Valid license" value={val(lead.has_license)} />
        <Field label="License suspended/expired" value={val(lead.license_suspended)} />
        <Field label="Has insurance" value={val(lead.has_insurance)} />
        <Field label="Rented before" value={val(lead.rented_before)} />
        <Field label="Driving history (5 yrs)" value={val(lead.driving_history)} />
        <Field label="Income source" value={val(lead.income_source)} />
        <Field label="Proof of income (2 months)" value={val(lead.proof_of_income)} />
        <Field label="Can pay first week today" value={val(lead.first_week_payment)} />
        <Field label="Additional driver" value={val(lead.additional_driver)} />
        <Field label="Agrees to rental agreement" value={val(lead.agrees_to_agreement)} />
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
