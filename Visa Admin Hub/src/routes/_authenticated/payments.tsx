import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, X, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { PageShell, PageHeader } from "@/components/admin/PageShell";
import type { Application } from "@/lib/applications";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({ meta: [{ title: "Payments — Admin" }] }),
  component: PaymentsPage,
});

type Period = "today" | "last7" | "last30" | "this_month" | "this_year";

const PERIODS: { key: Period; label: string; sublabel: string }[] = [
  { key: "today",      label: "Today",        sublabel: new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" }) },
  { key: "last7",      label: "Last 7 Days",  sublabel: "Rolling week" },
  { key: "last30",     label: "Last 30 Days", sublabel: "Rolling month" },
  { key: "this_month", label: "This Month",   sublabel: new Date().toLocaleDateString("en", { month: "long", year: "numeric" }) },
  { key: "this_year",  label: "This Year",    sublabel: new Date().getFullYear().toString() },
];

function inPeriod(d: Date, period: Period): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (period) {
    case "today":      return d >= today;
    case "last7":      { const c = new Date(today); c.setDate(c.getDate() - 6);  return d >= c; }
    case "last30":     { const c = new Date(today); c.setDate(c.getDate() - 29); return d >= c; }
    case "this_month": return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    case "this_year":  return d.getFullYear() === now.getFullYear();
  }
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function PaymentsPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <PaymentsContent /> : <AccessDenied requiredRole="admin" />;
}

function PaymentsContent() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("this_month");
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "standard" | "express">("all");

  useEffect(() => {
    let on = true;
    const load = async () => {
      const { data } = await supabase.from("applications").select("*").order("paid_at", { ascending: false, nullsFirst: false });
      if (on) { setApps((data ?? []) as Application[]); setLoading(false); }
    };
    load();
    const ch = supabase.channel("pay-apps")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, load)
      .subscribe();
    return () => { on = false; supabase.removeChannel(ch); };
  }, []);

  // All paid, filtered by type + search
  const paidAll = useMemo(() => apps.filter(a => {
    if (!a.paid || !a.paid_at) return false;
    return (
      (typeFilter === "all" || a.type === typeFilter) &&
      (q === "" || `${a.full_name} ${a.reference} ${a.email} ${a.nationality}`.toLowerCase().includes(q.toLowerCase()))
    );
  }), [apps, typeFilter, q]);

  // KPI totals per period
  const kpis = useMemo(() =>
    PERIODS.map(p => {
      const items = paidAll.filter(a => inPeriod(new Date(a.paid_at!), p.key));
      return { ...p, count: items.length, total: items.reduce((s, a) => s + Number(a.fee), 0) };
    }),
  [paidAll]);

  // Active period transactions
  const activeItems = useMemo(() =>
    paidAll.filter(a => inPeriod(new Date(a.paid_at!), period)),
  [paidAll, period]);

  const activeTotal = useMemo(() => activeItems.reduce((s, a) => s + Number(a.fee), 0), [activeItems]);

  // For "Last 7" and "Last 30" views, group by local date for the sub-grid
  const dateBuckets = useMemo(() => {
    if (period !== "last7" && period !== "last30") return [];
    const map = new Map<string, { label: string; count: number; total: number }>();
    for (const a of activeItems) {
      const d = new Date(a.paid_at!);
      const key = localDateKey(d);
      const label = d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
      const b = map.get(key) ?? { label, count: 0, total: 0 };
      b.count++; b.total += Number(a.fee);
      map.set(key, b);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [activeItems, period]);

  const refundRequested = apps.filter(a => a.refund_status === "requested").length;

  const exportCsv = () => {
    const rows: string[][] = [["Reference", "Applicant", "Email", "Nationality", "Type", "Amount", "Paid at"]];
    activeItems.forEach(a => rows.push([a.reference, a.full_name, a.email, a.nationality, a.type, String(a.fee), a.paid_at ?? ""]));
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a"); link.href = url; link.download = `payments-${period}.csv`; link.click();
    URL.revokeObjectURL(url);
  };

  const activePeriod = PERIODS.find(p => p.key === period)!;

  return (
    <PageShell>
      <PageHeader eyebrow="Finance · Reconciliation" title="Payments" />

      {/* Period selector dropdown (#28) */}
      <div className="mt-6 flex items-center gap-3">
        <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Period</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="rounded-sm border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {PERIODS.map(p => (
            <option key={p.key} value={p.key}>{p.label} — {p.sublabel}</option>
          ))}
        </select>
      </div>

      {/* Summary row */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-sm border border-border bg-card p-4 shadow-card">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">All-time collected</div>
          <div className="mt-1 font-serif text-2xl text-foreground">${paidAll.reduce((s, a) => s + Number(a.fee), 0).toLocaleString()}</div>
        </div>
        <div className={`rounded-sm border p-4 shadow-card ${refundRequested > 0 ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"}`}>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Refund requests</div>
          <div className={`mt-1 font-serif text-2xl ${refundRequested > 0 ? "text-destructive" : "text-foreground"}`}>{refundRequested}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-sm border border-border bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-input bg-background px-3 py-1.5 text-sm sm:flex-none">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, reference, email…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70 sm:w-56" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="rounded-sm border border-input bg-background px-3 py-1.5 text-sm">
            <option value="all">All types</option>
            <option value="standard">Standard</option>
            <option value="express">Express</option>
          </select>
          {(q || typeFilter !== "all") && (
            <button onClick={() => { setQ(""); setTypeFilter("all"); }}
              className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1 text-[11px] uppercase tracking-wider text-muted-foreground hover:border-destructive hover:text-destructive">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Daily breakdown grid for last7 / last30 */}
      {dateBuckets.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {dateBuckets.map(([key, b]) => (
            <div key={key} className="rounded-sm border border-border bg-card p-3 shadow-card">
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{b.label}</div>
              <div className="mt-1 font-serif text-base text-accent">${b.total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{b.count} txn</div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction table */}
      <div className="mt-5 overflow-hidden rounded-sm border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Transactions · {activePeriod.label}
            </div>
            <div className="font-serif text-lg text-foreground">
              {activeItems.length} settled · ${activeTotal.toLocaleString()} USD
            </div>
          </div>
          <button onClick={exportCsv} disabled={activeItems.length === 0}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-foreground hover:border-accent disabled:opacity-40">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Reference</th>
                <th className="px-6 py-3 text-left font-medium">Applicant</th>
                <th className="px-6 py-3 text-left font-medium">Type</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
                <th className="px-6 py-3 text-left font-medium">Paid at</th>
                <th className="px-6 py-3 text-left font-medium">Refund</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</td></tr>
              )}
              {!loading && activeItems.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">No transactions in this period.</td></tr>
              )}
              {activeItems.map(a => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <td className="px-6 py-4">
                    <Link to="/applications/$id" params={{ id: a.id }} className="font-mono text-xs text-primary hover:text-accent">{a.reference}</Link>
                  </td>
                  <td className="max-w-[180px] truncate px-6 py-4 text-foreground">{a.full_name}</td>
                  <td className="px-6 py-4 text-xs uppercase">{a.type}</td>
                  <td className="px-6 py-4 text-right font-medium">${Number(a.fee).toLocaleString()}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs text-muted-foreground">
                    {a.paid_at ? new Date(a.paid_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {a.refund_status ? (
                      <span className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${
                        a.refund_status === "processed" ? "bg-success/15 text-success" :
                        a.refund_status === "approved"  ? "bg-accent/15 text-accent" :
                        a.refund_status === "rejected"  ? "bg-destructive/10 text-destructive" :
                        "bg-warning/20 text-foreground"
                      }`}>
                        {a.refund_status}
                        {a.refund_amount ? ` · $${a.refund_amount}` : ""}
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            {activeItems.length > 0 && (
              <tfoot>
                <tr className="bg-secondary/40">
                  <td colSpan={3} className="px-6 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Total</td>
                  <td className="px-6 py-3 text-right font-serif text-accent">${activeTotal.toLocaleString()}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </PageShell>
  );
}
