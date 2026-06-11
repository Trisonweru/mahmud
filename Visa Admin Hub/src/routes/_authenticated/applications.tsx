import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Download, Loader2, Eye, Copy, ChevronDown, ChevronRight, X, RotateCcw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ALL_STATUSES, statusLabels, docTypeLabels, type AppDocument, type AppStatus, type Application, type DocType } from "@/lib/applications";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PageShell, PageHeader } from "@/components/admin/PageShell";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ACTION_STATUSES: { value: AppStatus; label: string }[] = [
  { value: "in_review", label: "Under Review" },
  { value: "additional_info", label: "Info Required" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Denied" },
];

// Statuses that belong to Queue, not shown in Applications list (#13)
const QUEUE_ONLY_STATUSES: AppStatus[] = ["awaiting_etas", "pending_payment" as AppStatus];

// Status filter options shown in Applications (#16 — no pending_payment)
const FILTER_STATUSES = ALL_STATUSES.filter(s => !QUEUE_ONLY_STATUSES.includes(s));

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({ meta: [{ title: "Applications — Somalia eVisa Admin" }] }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [docsByApp, setDocsByApp] = useState<Record<string, AppDocument[]>>({});
  const [loading, setLoading] = useState(true);
  const [busyDoc, setBusyDoc] = useState<string | null>(null);
  const [busyStatus, setBusyStatus] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [status, setStatus] = useState<AppStatus | "all">("submitted"); // #21 default
  const [type, setType] = useState<"all" | "standard" | "express">("all");
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [nationality, setNationality] = useState("");
  const [viewing, setViewing] = useState<Application | null>(null);
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    const { data } = await supabase.from("applications").select("*").order("etas_submitted", { ascending: false }).order("submitted_at", { ascending: false });
    const { data: docs } = await supabase.from("application_documents").select("*").order("uploaded_at", { ascending: false });
    setApps((data ?? []) as Application[]);
    const grouped: Record<string, AppDocument[]> = {};
    for (const d of (docs ?? []) as AppDocument[]) {
      (grouped[d.application_id] ??= []).push(d);
    }
    setDocsByApp(grouped);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
    const ch = supabase.channel("apps-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "application_documents" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const downloadDoc = async (doc: AppDocument) => {
    setBusyDoc(doc.id);
    const { data, error } = await supabase.storage
      .from("application-documents")
      .createSignedUrl(doc.storage_path, 600, { download: doc.file_name });
    setBusyDoc(null);
    if (error || !data) { toast.error(error?.message ?? "Could not open file"); return; }
    window.location.href = data.signedUrl;
  };

  const moveToQueue = async (a: Application) => {
    if (!confirm(`Return "${a.full_name}" to the Queue? This will clear the ETAS submission record.`)) return;
    setBusyStatus(a.id);
    const { error } = await supabase.from("applications").update({
      status: "awaiting_etas",
      etas_submitted: false,
      etas_reference: null,
      etas_submitted_by: null,
    }).eq("id", a.id);
    setBusyStatus(null);
    if (error) toast.error(error.message);
    else { toast.success("Application returned to Queue"); load(); }
  };

  const updateStatus = async (a: Application, next: AppStatus) => {
    if (next === "approved" && (!a.etas_submitted || !a.etas_reference)) {
      toast.error("ETAS reference must be recorded before approval");
      return;
    }
    setBusyStatus(a.id);
    setApps(prev => prev.map(app => app.id === a.id ? { ...app, status: next } : app));
    const { error } = await supabase.from("applications").update({ status: next }).eq("id", a.id);
    setBusyStatus(null);
    if (error) {
      setApps(prev => prev.map(app => app.id === a.id ? { ...app, status: a.status } : app));
      toast.error(error.message);
    } else {
      toast.success(`Status updated to ${statusLabels[next]}`);
      load();
    }
  };

  const nationalities = useMemo(() => Array.from(new Set(apps.map(a => a.nationality))).sort(), [apps]);

  const filtered = useMemo(() => apps.filter(a => {
    const submittedDate = a.submitted_at.slice(0, 10);
    return (
      !QUEUE_ONLY_STATUSES.includes(a.status) && // #13 — never show queue-only statuses here
      (status === "all" || a.status === status) &&
      (type === "all" || a.type === type) &&
      (nationality === "" || a.nationality === nationality) &&
      (dateFrom === "" || submittedDate >= dateFrom) &&
      (dateTo === "" || submittedDate <= dateTo) &&
      (q === "" || `${a.full_name} ${a.reference} ${a.email} ${a.nationality} ${a.passport_number}`.toLowerCase().includes(q.toLowerCase()))
    );
  }), [apps, status, type, nationality, dateFrom, dateTo, q]);

  const DEFAULT_STATUS = "submitted";
  const hasFilters = status !== DEFAULT_STATUS || type !== "all" || nationality !== "" || dateFrom !== "" || dateTo !== "" || q !== "";
  const clearFilters = () => { setStatus(DEFAULT_STATUS); setType("all"); setNationality(""); setDateFrom(""); setDateTo(""); setQ(""); };

  const deleteSingle = async (a: Application) => {
    if (!confirm(`Permanently delete ${a.full_name} (${a.reference}) and all associated documents? This cannot be undone.`)) return;
    setBulkDeleting(true);
    await supabase.from("application_documents").delete().eq("application_id", a.id);
    await supabase.from("application_notes").delete().eq("application_id", a.id);
    const { error } = await supabase.from("applications").delete().eq("id", a.id);
    setBulkDeleting(false);
    if (error) toast.error(error.message);
    else { toast.success("Application deleted"); load(); }
  };

  const deleteAllFiltered = async () => {
    if (filtered.length === 0) return;
    const count = filtered.length;
    const phrase = prompt(
      `This will PERMANENTLY delete ${count} application${count === 1 ? "" : "s"} matching the current filters — including all of their documents and notes. This cannot be undone.\n\nType DELETE to confirm.`
    );
    if (phrase === null) return;
    if (phrase.trim().toUpperCase() !== "DELETE") {
      toast.error("Confirmation phrase did not match — nothing was deleted");
      return;
    }
    setBulkDeleting(true);
    const ids = filtered.map(a => a.id);
    await supabase.from("application_documents").delete().in("application_id", ids);
    await supabase.from("application_notes").delete().in("application_id", ids);
    const { error } = await supabase.from("applications").delete().in("id", ids);
    setBulkDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${count} application${count === 1 ? "" : "s"} deleted`);
    load();
  };

  const grouped = useMemo(() => {
    const map = new Map<string, { key: string; label: string; items: Application[] }>();
    for (const a of filtered) {
      const d = new Date(a.submitted_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString(undefined, { month: "long", year: "numeric" });
      if (!map.has(key)) map.set(key, { key, label, items: [] });
      map.get(key)!.items.push(a);
    }
    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [filtered]);

  // Default: most recent month open
  useEffect(() => {
    if (grouped.length && Object.keys(openMonths).length === 0) {
      setOpenMonths({ [grouped[0].key]: true });
    }
  }, [grouped, openMonths]);

  const copy = async (label: string, value?: string | null) => {
    if (!value) return;
    try { await navigator.clipboard.writeText(String(value)); toast.success(`${label} copied`); }
    catch { toast.error("Copy failed"); }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Operations"
        title="Applications"
        meta={`${filtered.length} of ${apps.length} records`}
      />

      <div className="mt-6 space-y-3 rounded-sm border border-border bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-input bg-background px-3 py-1.5 text-sm sm:flex-none">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, reference, email, passport…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70 sm:w-64" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as AppStatus | "all")} className="rounded-sm border border-input bg-background px-3 py-1.5 text-sm">
            <option value="all">All statuses</option>
            {FILTER_STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value as "all" | "standard" | "express")} className="rounded-sm border border-input bg-background px-3 py-1.5 text-sm">
            <option value="all">All types</option>
            <option value="standard">Standard</option>
            <option value="express">Express</option>
          </select>
          <select value={nationality} onChange={(e) => setNationality(e.target.value)} className="rounded-sm border border-input bg-background px-3 py-1.5 text-sm">
            <option value="">All nationalities</option>
            {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">Date range</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-sm border border-input bg-background px-2 py-1 text-sm" />
            <span>to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-sm border border-input bg-background px-2 py-1 text-sm" />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1 text-[11px] uppercase tracking-wider text-muted-foreground hover:border-destructive hover:text-destructive">
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
          {isSuperAdmin && filtered.length > 0 && (
            <button
              onClick={deleteAllFiltered}
              disabled={bulkDeleting}
              className="ml-auto inline-flex items-center gap-1 rounded-sm border border-destructive/40 bg-destructive/5 px-2.5 py-1 text-[11px] uppercase tracking-wider text-destructive hover:bg-destructive/10 disabled:opacity-50"
              title="Permanently delete every application currently shown by the filters above"
            >
              {bulkDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              Delete all shown ({filtered.length})
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {loading && (
          <div className="rounded-sm border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground shadow-card">Loading…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="rounded-sm border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground shadow-card">No applications match your filters.</div>
        )}
        {!loading && grouped.map(group => {
          const isOpen = !!openMonths[group.key];
          return (
          <div key={group.key} className="overflow-hidden rounded-sm border border-border bg-card shadow-card">
            <button
              type="button"
              onClick={() => setOpenMonths(s => ({ ...s, [group.key]: !s[group.key] }))}
              className="flex w-full items-center justify-between gap-3 border-b border-border bg-secondary/50 px-6 py-3 text-left hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                {isOpen ? <ChevronDown className="h-4 w-4 text-accent" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <span className="font-serif text-lg text-foreground">{group.label}</span>
              </div>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{group.items.length} application{group.items.length === 1 ? "" : "s"}</span>
            </button>
            {isOpen && (
            <div className="divide-y divide-border">
              {group.items.map(a => (
                <div key={a.id} className="px-6 py-5 even:bg-secondary/10 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground">{a.full_name}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        <Link to="/applications/$id" params={{ id: a.id }} className="font-mono text-primary hover:text-accent">{a.reference}</Link>
                        {" · "}{new Date(a.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      <span className={`text-[10px] uppercase tracking-wider ${a.type === "express" ? "font-semibold text-accent" : "text-muted-foreground"}`}>{a.type}</span>
                      <StatusBadge status={a.status} />
                      {a.paid
                        ? <span className="rounded-sm bg-success/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-success">✓ ${Number(a.fee)}</span>
                        : <span className="rounded-sm bg-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Payment pending</span>}
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Nationality</dt>
                      <dd className="mt-0.5 text-sm text-foreground">{a.nationality}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Passport</dt>
                      <dd className="mt-0.5 font-mono text-xs text-foreground">{a.passport_number}</dd>
                      <dd className="text-[11px] text-muted-foreground">exp {new Date(a.passport_expiry).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Date of Birth</dt>
                      <dd className="mt-0.5 text-sm text-foreground">{new Date(a.dob).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Contact</dt>
                      <dd className="mt-0.5 text-xs text-foreground">{a.email}</dd>
                      {a.phone && <dd className="text-[11px] text-muted-foreground">{a.phone}</dd>}
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">ETAS Ref</dt>
                      <dd className="mt-0.5 text-xs">
                        {a.etas_submitted
                          ? <span className="font-mono text-success">✓ {a.etas_reference}</span>
                          : a.paid
                            ? <span className="font-medium text-warning">Pending</span>
                            : <span className="text-muted-foreground">—</span>}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
                    <button
                      type="button"
                      onClick={() => setViewing(a)}
                      className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2.5 py-1.5 text-[10px] uppercase tracking-wider hover:border-accent hover:bg-accent-soft"
                    >
                      <Eye className="h-3 w-3" /> View & Docs
                    </button>
                    {a.etas_submitted ? (
                      <select
                        value={ACTION_STATUSES.some(s => s.value === a.status) ? a.status : ""}
                        disabled={busyStatus === a.id}
                        onChange={(e) => updateStatus(a, e.target.value as AppStatus)}
                        className="rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs"
                      >
                        <option value="" disabled>Update status…</option>
                        {ACTION_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    ) : a.status === "rejected" || a.refund_status === "processed" ? (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {a.status === "rejected" ? "Application denied" : "Refund processed"}
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Awaiting ETAS submission</span>
                    )}
                    {isAdmin && a.etas_submitted && (
                      <button
                        type="button"
                        disabled={busyStatus === a.id}
                        onClick={() => moveToQueue(a)}
                        className="ml-auto inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:border-warning hover:text-warning disabled:opacity-50"
                        title="Return to Queue"
                      >
                        <RotateCcw className="h-3 w-3" /> Return to Queue
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button
                        type="button"
                        disabled={bulkDeleting}
                        onClick={() => deleteSingle(a)}
                        className="ml-auto inline-flex items-center gap-1 rounded-sm border border-destructive/40 bg-destructive/5 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        title="Delete this application"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
          );
        })}
      </div>

      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {viewing && (
            <>
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl">{viewing.full_name}</SheetTitle>
                <SheetDescription>
                  Reference <span className="font-mono">{viewing.reference}</span> · all fields below can be copied for ETAS entry.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5 text-sm">
                {viewing.type === "express" && (
                  <div className="rounded-sm border border-accent/30 bg-accent/5 px-4 py-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-accent uppercase tracking-wider text-[10px]">Express application</span>
                    <p className="mt-1">Applicant details below were extracted from passport documents via OCR. Verify against uploaded files before processing.</p>
                  </div>
                )}

                <DetailGroup title="Personal">
                  <DetailRow label={viewing.type === "express" ? "Name (from passport)" : "Full legal name"} value={viewing.full_name} onCopy={copy} />
                  <DetailRow label="Date of birth" value={new Date(viewing.dob).toLocaleDateString()} onCopy={copy} />
                  <DetailRow label="Nationality" value={viewing.nationality} onCopy={copy} />
                  <DetailRow label="Email" value={viewing.email} onCopy={copy} />
                  {viewing.phone && <DetailRow label="Contact / WhatsApp" value={viewing.phone} onCopy={copy} />}
                </DetailGroup>

                <DetailGroup title="Passport">
                  <DetailRow label="Passport number" value={viewing.passport_number} onCopy={copy} mono />
                  <DetailRow label="Passport expiry" value={new Date(viewing.passport_expiry).toLocaleDateString()} onCopy={copy} />
                </DetailGroup>

                {viewing.type === "standard" && viewing.purpose && (
                  <DetailGroup title="Travel">
                    <DetailRow label="Purpose" value={viewing.purpose} onCopy={copy} />
                    {viewing.address_in_somalia && <DetailRow label="Address in Somalia" value={viewing.address_in_somalia} onCopy={copy} />}
                    {viewing.arrival_date && <DetailRow label="Arrival" value={new Date(viewing.arrival_date).toLocaleDateString()} onCopy={copy} />}
                    {viewing.departure_date && <DetailRow label="Departure" value={new Date(viewing.departure_date).toLocaleDateString()} onCopy={copy} />}
                  </DetailGroup>
                )}

                <DetailGroup title="Application">
                  <DetailRow label="Type" value={viewing.type} onCopy={copy} />
                  <DetailRow label="Fee" value={`$${Number(viewing.fee)} USD`} onCopy={copy} />
                  <DetailRow label="Payment" value={viewing.paid ? "Paid" : "Not paid"} />
                  {viewing.etas_reference && <DetailRow label="ETAS reference" value={viewing.etas_reference} onCopy={copy} mono />}
                </DetailGroup>

                <div>
                  <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Documents</div>
                  {(docsByApp[viewing.id] ?? []).length === 0 ? (
                    <div className="text-xs text-destructive">No documents uploaded.</div>
                  ) : (
                    <div className="space-y-2">
                      {(docsByApp[viewing.id] ?? []).map(d => (
                        <div key={d.id} className="flex items-center justify-between rounded-sm border border-border bg-card px-3 py-2">
                          <div className="min-w-0">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">{docTypeLabels[d.doc_type as DocType]}</div>
                            <div className="truncate text-sm text-foreground" title={d.file_name}>{d.file_name}</div>
                          </div>
                          <button
                            onClick={() => downloadDoc(d)}
                            disabled={busyDoc === d.id}
                            className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-border bg-card px-2 py-1 text-[10px] uppercase tracking-wider hover:border-accent hover:bg-accent-soft disabled:opacity-60"
                          >
                            {busyDoc === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}

function DetailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
      <div className="divide-y divide-border rounded-sm border border-border bg-card">
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value, onCopy, mono }: { label: string; value: string; onCopy?: (l: string, v?: string | null) => void; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`truncate text-sm text-foreground ${mono ? "font-mono" : ""}`} title={value}>{value}</div>
      </div>
      {onCopy && (
        <button
          onClick={() => onCopy(label, value)}
          className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider hover:border-accent hover:text-accent"
          title={`Copy ${label}`}
        >
          <Copy className="h-3 w-3" /> Copy
        </button>
      )}
    </div>
  );
}
