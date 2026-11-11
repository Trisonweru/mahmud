import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { PageShell, PageHeader } from "@/components/admin/PageShell";
import type { Application } from "@/lib/applications";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AnalyticsContent /> : <AccessDenied requiredRole="admin" />;
}

function AnalyticsContent() {
  const [apps, setApps] = useState<Application[]>([]);
  useEffect(() => {
    supabase.from("applications").select("*").then(({ data }) => setApps((data ?? []) as Application[]));
  }, []);
  const byNat = aggregate(apps, a => a.nationality).slice(0, 10);
  const byPurpose = aggregate(apps, a => a.purpose).slice(0, 8);

  return (
    <PageShell>
      <PageHeader eyebrow="Insights" title="Analytics" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Top nationalities">
          <div className="h-72"><ResponsiveContainer><BarChart data={byNat}><CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)" /><XAxis dataKey="name" fontSize={11} stroke="oklch(0.46 0.02 260)" /><YAxis fontSize={11} stroke="oklch(0.46 0.02 260)" /><Tooltip /><Bar dataKey="value" fill="oklch(0.34 0.07 260)" /></BarChart></ResponsiveContainer></div>
        </Card>
        <Card title="Travel purpose">
          <div className="h-72"><ResponsiveContainer><BarChart data={byPurpose}><CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)" /><XAxis dataKey="name" fontSize={11} stroke="oklch(0.46 0.02 260)" /><YAxis fontSize={11} stroke="oklch(0.46 0.02 260)" /><Tooltip /><Bar dataKey="value" fill="oklch(0.66 0.14 70)" /></BarChart></ResponsiveContainer></div>
        </Card>
      </div>
    </PageShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-card p-6 shadow-card">
      <div className="font-serif text-xl text-foreground">{title}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function aggregate(apps: Application[], key: (a: Application) => string) {
  const m = new Map<string, number>();
  apps.forEach(a => m.set(key(a), (m.get(key(a)) ?? 0) + 1));
  return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
