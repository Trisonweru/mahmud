import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PageShell, PageHeader } from "@/components/admin/PageShell";
import type { Application } from "@/lib/applications";
import { formatMoney, sumByCurrency, formatCurrencyTotals } from "@/lib/applications";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Dashboard — Somalia eVisa Admin" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    setLoading(true);
    supabase.from("applications").select("*").order("submitted_at", { ascending: false })
      .then(({ data }) => { if (!on) return; setApps((data ?? []) as Application[]); setLoading(false); });

    const ch = supabase.channel("apps-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, async () => {
        const { data } = await supabase.from("applications").select("*").order("submitted_at", { ascending: false });
        if (on) setApps((data ?? []) as Application[]);
      }).subscribe();
    return () => { on = false; supabase.removeChannel(ch); };
  }, []);

  const recent = apps.slice(0, 20);

  // All-time revenue totals, consistent with the Payments page's period calculation.
  // Fees can be charged in more than one currency, so totals are grouped per currency
  // rather than summed together as one number.
  const paidApps = useMemo(() => apps.filter(a => a.paid && a.paid_at), [apps]);
  const grossByCurrency = useMemo(() => sumByCurrency(paidApps, a => Number(a.fee), a => a.currency), [paidApps]);
  const refundedApps = useMemo(() => apps.filter(a => a.refund_status === "refunded"), [apps]);
  const refundedByCurrency = useMemo(() => sumByCurrency(refundedApps, a => Number(a.refund_amount ?? a.fee), a => a.currency), [refundedApps]);
  const netByCurrency = useMemo(() => {
    const net = { ...grossByCurrency };
    for (const [currency, amount] of Object.entries(refundedByCurrency)) {
      net[currency] = (net[currency] ?? 0) - amount;
    }
    return net;
  }, [grossByCurrency, refundedByCurrency]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Overview"
        title="Programme dashboard"
        action={
          <div className="rounded-md border border-border bg-card px-4 py-2 text-right text-xs shadow-card">
            <div className="text-muted-foreground">Last updated</div>
            <div className="font-medium text-foreground">{new Date().toLocaleString()}</div>
          </div>
        }
      />

      {/* Revenue summary */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-4 shadow-card">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Gross revenue</div>
          <div className="mt-1 font-serif text-2xl text-foreground">{formatCurrencyTotals(grossByCurrency)}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 shadow-card">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Refunded amount</div>
          <div className="mt-1 font-serif text-2xl text-foreground">{formatCurrencyTotals(refundedByCurrency)}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 shadow-card">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Net revenue</div>
          <div className="mt-1 font-serif text-2xl text-foreground">{formatCurrencyTotals(netByCurrency)}</div>
        </div>
      </div>

      {/* Recent applications table */}
      <div className="mt-8 overflow-hidden rounded-md border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Recent activity</div>
            <div className="mt-0.5 font-serif text-xl text-foreground">Latest applications</div>
          </div>
          <Link to="/applications" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent hover:text-primary transition-colors">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">No applications yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reference</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Applicant</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nationality</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Paid</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                  >
                    <td className="px-6 py-3.5">
                      <Link to="/applications/$id" params={{ id: a.id }} className="font-mono text-xs font-medium text-primary hover:text-accent transition-colors">
                        {a.reference}
                      </Link>
                    </td>
                    <td className="max-w-[160px] truncate px-6 py-3.5 font-medium text-foreground">{a.full_name}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{a.nationality}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={a.status} /></td>
                    <td className="px-6 py-3.5 text-xs">
                      {a.paid
                        ? <span className="font-semibold text-success">{formatMoney(Number(a.fee), a.currency)}</span>
                        : <span className="text-muted-foreground/60">unpaid</span>
                      }
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-xs text-muted-foreground">
                      {new Date(a.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}
