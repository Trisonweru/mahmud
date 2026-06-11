import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { PageShell, PageHeader } from "@/components/admin/PageShell";
import type { Application } from "@/lib/applications";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({ meta: [{ title: "Customers — Admin" }] }),
  component: CustomersPage,
});

interface Customer { name: string; email: string; nationality: string; applications: number; totalSpent: number; lastActivity: string; }
type SortKey = "lastActivity" | "totalSpent" | "applications" | "name";

function CustomersPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <CustomersContent /> : <AccessDenied requiredRole="admin" />;
}

function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [nationality, setNationality] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("lastActivity");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    supabase.from("applications").select("*").then(({ data }) => {
      const apps = (data ?? []) as Application[];
      const map = new Map<string, Customer>();
      apps.forEach(a => {
        const c = map.get(a.email) ?? { name: a.full_name, email: a.email, nationality: a.nationality, applications: 0, totalSpent: 0, lastActivity: a.submitted_at };
        c.applications++;
        if (a.paid) c.totalSpent += Number(a.fee);
        if (a.submitted_at > c.lastActivity) c.lastActivity = a.submitted_at;
        map.set(a.email, c);
      });
      setCustomers(Array.from(map.values()));
      setLoading(false);
    });
  }, []);

  const nationalities = useMemo(() => Array.from(new Set(customers.map(c => c.nationality))).sort(), [customers]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    let list = customers.filter(c =>
      (nationality === "" || c.nationality === nationality) &&
      (q === "" || `${c.name} ${c.email} ${c.nationality}`.toLowerCase().includes(q.toLowerCase()))
    );
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "lastActivity") cmp = a.lastActivity.localeCompare(b.lastActivity);
      else if (sortBy === "totalSpent") cmp = a.totalSpent - b.totalSpent;
      else if (sortBy === "applications") cmp = a.applications - b.applications;
      else cmp = a.name.localeCompare(b.name);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [customers, q, nationality, sortBy, sortDir]);

  const hasFilters = q !== "" || nationality !== "";
  const clearFilters = () => { setQ(""); setNationality(""); };

  const SortTh = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      onClick={() => toggleSort(col)}
      className="px-6 py-3 text-left font-medium cursor-pointer select-none hover:text-foreground"
    >
      {label}{sortBy === col ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
    </th>
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow="Directory"
        title="Customers"
        meta={`${filtered.length} of ${customers.length} unique applicants`}
      />

      <div className="mt-6 rounded-sm border border-border bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-input bg-background px-3 py-1.5 text-sm sm:flex-none">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70 sm:w-56" />
          </div>
          <select value={nationality} onChange={(e) => setNationality(e.target.value)} className="rounded-sm border border-input bg-background px-3 py-1.5 text-sm">
            <option value="">All nationalities</option>
            {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1 text-[11px] uppercase tracking-wider text-muted-foreground hover:border-destructive hover:text-destructive">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-sm border border-border bg-card shadow-card">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-border bg-secondary/50 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <SortTh col="name" label="Name" />
              <th className="px-6 py-3 text-left font-medium">Email</th>
              <th className="px-6 py-3 text-left font-medium">Nationality</th>
              <SortTh col="applications" label="Applications" />
              <SortTh col="totalSpent" label="Lifetime spend" />
              <SortTh col="lastActivity" label="Last activity" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">No customers match your filters.</td></tr>}
            {filtered.map(c => (
              <tr key={c.email} className="border-b border-border last:border-0 hover:bg-secondary/40">
                <td className="max-w-[160px] truncate px-6 py-4 text-foreground">{c.name}</td>
                <td className="max-w-[200px] truncate px-6 py-4 text-muted-foreground">{c.email}</td>
                <td className="px-6 py-4 text-muted-foreground">{c.nationality}</td>
                <td className="px-6 py-4">{c.applications}</td>
                <td className="px-6 py-4 text-success">${c.totalSpent.toLocaleString()}</td>
                <td className="whitespace-nowrap px-6 py-4 text-xs text-muted-foreground">{new Date(c.lastActivity).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
