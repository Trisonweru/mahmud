import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, CheckCircle2, DollarSign, TrendingUp, AlertTriangle, ShieldCheck, Users, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PageShell, PageHeader } from "@/components/admin/PageShell";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import type { Application, AppRole } from "@/lib/applications";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Dashboard — Somalia eVisa Admin" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, isSuperAdmin } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffStats, setStaffStats] = useState<{ total: number; byRole: Record<string, number> } | null>(null);

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

  useEffect(() => {
    if (!isSuperAdmin) return;
    (async () => {
      const { data } = await supabase.from("user_roles").select("role");
      const byRole: Record<string, number> = {};
      ((data ?? []) as { role: AppRole }[]).forEach(r => { byRole[r.role] = (byRole[r.role] ?? 0) + 1; });
      setStaffStats({ total: data?.length ?? 0, byRole });
    })();
  }, [isSuperAdmin]);

  const total = apps.length;
  const approved = apps.filter(a => a.status === "approved").length;
  const isSubmittedToGov = (a: Application) => !!(a.etas_reference && a.etas_reference.trim().length > 0);
  const awaitingEtas = apps.filter(a => a.paid && !isSubmittedToGov(a) && a.status !== "rejected").length;
  const submittedToGov = apps.filter(isSubmittedToGov).length;
  const inReview = apps.filter(a => ["awaiting_etas", "in_review", "additional_info"].includes(a.status)).length;
  const revenue = apps.filter(a => a.paid).reduce((s, a) => s + Number(a.fee), 0);
  const approvalRate = total ? Math.round((approved / total) * 100) : 0;

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
  const revThisMonth = apps.filter(a => a.paid && a.paid_at?.startsWith(thisMonthKey)).reduce((s, a) => s + Number(a.fee), 0);
  const revLastMonth = apps.filter(a => a.paid && a.paid_at?.startsWith(lastMonthKey)).reduce((s, a) => s + Number(a.fee), 0);
  const momDelta = revLastMonth > 0 ? Math.round(((revThisMonth - revLastMonth) / revLastMonth) * 100) : null;

  const days: { date: string; received: number; approved: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    days.push({
      date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      received: apps.filter(a => a.submitted_at.startsWith(key)).length,
      approved: apps.filter(a => a.status === "approved" && (a.updated_at ?? "").startsWith(key)).length,
    });
  }
  const recent = apps.slice(0, 7);
  const myAssigned = user ? apps.filter(a => a.assigned_to === user.id && a.status !== "approved" && a.status !== "rejected").length : 0;

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

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/applications" className="block rounded-md transition-all hover:-translate-y-0.5 hover:shadow-elegant">
          <StatCard label="Total applications" value={total.toString()} delta={`${myAssigned} assigned to you`} icon={FileText} tone="info" />
        </Link>
        <Link to="/applications" className="block rounded-md transition-all hover:-translate-y-0.5 hover:shadow-elegant">
          <StatCard label="Approval rate" value={`${approvalRate}%`} delta={`${approved} approved total`} icon={CheckCircle2} tone="success" />
        </Link>
        <Link to="/queue" className="block rounded-md transition-all hover:-translate-y-0.5 hover:shadow-elegant">
          <StatCard
            label="Awaiting gov. submission"
            value={awaitingEtas.toString()}
            delta={awaitingEtas > 0 ? "Action required" : "All clear"}
            icon={AlertTriangle}
            tone={awaitingEtas > 0 ? "gold" : "teal"}
          />
        </Link>
        <Link to="/payments" className="block rounded-md transition-all hover:-translate-y-0.5 hover:shadow-elegant">
          <StatCard label="Revenue (USD)" value={`$${revenue.toLocaleString()}`} delta="Paid fees collected" icon={DollarSign} tone="gold" />
        </Link>
      </div>

      {/* Super admin panel */}
      {isSuperAdmin && (
        <div className="mt-5 overflow-hidden rounded-md border border-accent/30 bg-gradient-to-br from-card via-card to-accent/5 shadow-card">
          <div className="border-b border-accent/20 bg-gradient-gold/5 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-gold shadow-gold">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                  Super admin overview
                </div>
              </div>
              <Link
                to="/settings"
                className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent hover:text-primary transition-colors"
              >
                Manage staff <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
            <MiniStat
              icon={Users}
              label="Staff accounts"
              value={(staffStats?.total ?? 0).toString()}
              sub={`${staffStats?.byRole.super_admin ?? 0} super · ${staffStats?.byRole.admin ?? 0} admin · ${staffStats?.byRole.officer ?? 0} officer`}
              tone="gold"
            />
            <MiniStat
              icon={DollarSign}
              label="Revenue · this month"
              value={`$${revThisMonth.toLocaleString()}`}
              sub={momDelta === null ? "no prior month" : `${momDelta >= 0 ? "▲" : "▼"} ${Math.abs(momDelta)}% vs last month`}
              tone="success"
            />
            <MiniStat
              icon={DollarSign}
              label="Revenue · last month"
              value={`$${revLastMonth.toLocaleString()}`}
              sub={lastMonth.toLocaleDateString("en", { month: "long", year: "numeric" })}
              tone="info"
            />
            <MiniStat
              icon={FileText}
              label="Applications · this month"
              value={apps.filter(a => a.submitted_at.startsWith(thisMonthKey)).length.toString()}
              sub="submitted by applicants"
              tone="teal"
            />
          </div>
        </div>
      )}

      {/* Chart + queue */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Area chart */}
        <div className="overflow-hidden rounded-md border border-border bg-card shadow-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Last 14 days</div>
              <div className="mt-0.5 font-serif text-xl text-foreground">Applications received vs approved</div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info/10">
              <TrendingUp className="h-4 w-4 text-info" />
            </div>
          </div>
          <div className="p-6">
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={days} margin={{ left: -10, right: 5 }}>
                  <defs>
                    <linearGradient id="gReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.52 0.20 250)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="oklch(0.52 0.20 250)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.58 0.17 155)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="oklch(0.58 0.17 155)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 260)" vertical={false} />
                  <XAxis dataKey="date" stroke="oklch(0.50 0.02 260)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.50 0.02 260)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 6,
                      border: "1px solid oklch(0.88 0.014 260)",
                      fontSize: 12,
                      boxShadow: "0 4px 16px -4px oklch(0.22 0.07 262 / 0.12)",
                    }}
                    cursor={{ stroke: "oklch(0.88 0.014 260)", strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="received" name="Received" stroke="oklch(0.52 0.20 250)" fill="url(#gReceived)" strokeWidth={2.5} dot={false} />
                  <Area type="monotone" dataKey="approved" name="Approved" stroke="oklch(0.58 0.17 155)" fill="url(#gApproved)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex gap-5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-4 rounded-full bg-info" /> Received
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-4 rounded-full bg-success" /> Approved
              </div>
            </div>
          </div>
        </div>

        {/* Action queue */}
        <div className="overflow-hidden rounded-md border border-border bg-card shadow-card">
          <div className="border-b border-border px-6 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Action queue</div>
            <div className="mt-0.5 font-serif text-xl text-foreground">Submission status</div>
          </div>
          <div className="p-6 space-y-4 text-sm">
            <Link to="/queue"><QueueRow label="Awaiting government submission" value={awaitingEtas} highlight /></Link>
            <Link to="/applications"><QueueRow label="Submitted to government (ETAS)" value={submittedToGov} /></Link>
            <Link to="/applications"><QueueRow label="In review / additional info" value={inReview} /></Link>
            <Link to="/applications"><QueueRow label="Approved (issued)" value={approved} success /></Link>
          </div>
          {awaitingEtas > 0 && (
            <div className="px-6 pb-6">
              <Link to="/queue" className="flex items-start gap-3 rounded-md border border-warning/40 bg-warning/10 p-3.5 text-xs hover:bg-warning/20 transition-colors">
                <AlertTriangle className="h-4 w-4 shrink-0 text-warning mt-0.5" />
                <div className="text-foreground">
                  <strong>{awaitingEtas} application{awaitingEtas > 1 ? "s" : ""}</strong> paid but not yet submitted to the government portal. Open the queue →
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent applications table */}
      <div className="mt-5 overflow-hidden rounded-md border border-border bg-card shadow-card">
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
                        ? <span className="font-semibold text-success">${Number(a.fee).toLocaleString()}</span>
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

function QueueRow({ label, value, highlight, success }: { label: string; value: number; highlight?: boolean; success?: boolean }) {
  const barColor = highlight ? "bg-gradient-gold" : success ? "bg-gradient-emerald" : "bg-gradient-blue";
  const valueColor = highlight ? "text-warning font-bold" : success ? "text-success font-bold" : "text-muted-foreground";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs ${highlight || success ? "font-semibold text-foreground" : "text-foreground/80"}`}>{label}</span>
        <span className={`text-sm ${valueColor}`}>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(100, value * 4)}%` }} />
      </div>
    </div>
  );
}

type MiniTone = "gold" | "success" | "info" | "teal";
const miniToneStyles: Record<MiniTone, { bg: string; icon: string; value: string }> = {
  gold:    { bg: "bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20",    icon: "text-accent",   value: "text-foreground" },
  success: { bg: "bg-gradient-to-br from-success/10 to-success/5 border-success/20", icon: "text-success",  value: "text-success" },
  info:    { bg: "bg-gradient-to-br from-info/10 to-info/5 border-info/20",          icon: "text-info",     value: "text-info" },
  teal:    { bg: "bg-gradient-to-br from-teal/10 to-teal/5 border-teal/20",          icon: "text-teal",     value: "text-teal" },
};

function MiniStat({ icon: Icon, label, value, sub, tone }: { icon: typeof FileText; label: string; value: string; sub: string; tone: MiniTone }) {
  const s = miniToneStyles[tone];
  return (
    <div className={`rounded-md border p-4 ${s.bg}`}>
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${s.icon}`} />
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      </div>
      <div className={`mt-2.5 font-serif text-2xl font-semibold ${s.value}`}>{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
