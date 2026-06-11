import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Loader2, Download, Copy, Eye, Search, X, FolderOpen, Folder, XCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { docTypeLabels, INFO_SOURCE_NOTE_PREFIX, INFO_SOURCES, type AppDocument, type Application, type AppStatus, type DocType, type InfoSource } from "@/lib/applications";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageShell, PageHeader } from "@/components/admin/PageShell";

export const Route = createFileRoute("/_authenticated/queue")({
  head: () => ({ meta: [{ title: "Submission queue — Admin" }] }),
  component: QueuePage,
});

function QueuePage() {
  const { user, isSuperAdmin } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [docsByApp, setDocsByApp] = useState<Record<string, AppDocument[]>>({});
  const [loading, setLoading] = useState(true);
  const [etasRefs, setEtasRefs] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyDoc, setBusyDoc] = useState<string | null>(null);
  const [openDocs, setOpenDocs] = useState<Record<string, boolean>>({});
  const [viewing, setViewing] = useState<Application | null>(null);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "standard" | "express">("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("applications").select("*").eq("paid", true).eq("etas_submitted", false).neq("status", "rejected").or("refund_status.is.null,refund_status.eq.requested,refund_status.eq.rejected").order("paid_at", { ascending: true });
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
    load();
    const ch = supabase.channel("queue-apps")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "application_documents" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const ageHours = (a: Application) => {
    const t = new Date(a.paid_at ?? a.submitted_at).getTime();
    return Math.floor((Date.now() - t) / 3600000);
  };

  const filteredApps = useMemo(() => apps.filter(a => {
    const h = ageHours(a);
    return (
      (typeFilter === "all" || a.type === typeFilter) &&
      (!overdueOnly || h >= 24) &&
      (q === "" || `${a.full_name} ${a.reference} ${a.email} ${a.nationality} ${a.passport_number}`.toLowerCase().includes(q.toLowerCase()))
    );
  }), [apps, typeFilter, overdueOnly, q]);

  const hasFilters = q !== "" || typeFilter !== "all" || overdueOnly;
  const clearFilters = () => { setQ(""); setTypeFilter("all"); setOverdueOnly(false); };

  const downloadDoc = async (doc: AppDocument) => {
    setBusyDoc(doc.id);
    const { data, error } = await supabase.storage
      .from("application-documents")
      .createSignedUrl(doc.storage_path, 600, { download: doc.file_name });
    setBusyDoc(null);
    if (error || !data) { toast.error(error?.message ?? "Could not open file"); return; }
    window.location.href = data.signedUrl;
  };

  const rejectApplication = async (a: Application) => {
    const isPaid = !!a.paid;
    const msg = isPaid
      ? `Reject and request refund for ${a.full_name} (${a.reference})?\n\nThis will mark the application as denied and initiate a refund request. This cannot be undone from the queue.`
      : `Reject ${a.full_name} (${a.reference})? This cannot be undone from the queue.`;
    if (!confirm(msg)) return;
    setBusyId(a.id);
    setApps(prev => prev.filter(app => app.id !== a.id));
    const updates: Record<string, unknown> = { status: "rejected" };
    if (isPaid) {
      updates.refund_status = "requested";
      updates.refund_requested_at = new Date().toISOString();
      updates.refund_reason = "Application rejected from queue";
      updates.refund_amount = Number(a.fee);
    }
    const { error } = await supabase.from("applications").update(updates).eq("id", a.id);
    if (!error && isPaid) {
      await supabase.from("application_notes").insert({
        application_id: a.id,
        author_id: user?.id ?? null,
        body: `__AUDIT__ Refund requested · $${Number(a.fee)} — Application rejected from queue`,
      });
    }
    setBusyId(null);
    if (error) { load(); toast.error(error.message); }
    else toast.success(isPaid ? "Application rejected — refund request created" : "Application rejected");
  };

  const deleteApplication = async (a: Application) => {
    if (!confirm(`Permanently delete ${a.full_name} (${a.reference}) and all associated documents? This cannot be undone.`)) return;
    setBusyId(a.id);
    setApps(prev => prev.filter(app => app.id !== a.id));
    await supabase.from("application_documents").delete().eq("application_id", a.id);
    await supabase.from("application_notes").delete().eq("application_id", a.id);
    const { error } = await supabase.from("applications").delete().eq("id", a.id);
    setBusyId(null);
    if (error) { load(); toast.error(error.message); }
    else toast.success("Application deleted");
  };

  const setInfoSource = async (a: Application, source: InfoSource) => {
    setBusyId(a.id);
    await supabase.from("applications").update({ status: "additional_info" }).eq("id", a.id);
    await supabase.from("application_notes").insert({
      application_id: a.id,
      author_id: user?.id ?? null,
      body: `${INFO_SOURCE_NOTE_PREFIX}${source}`,
    });
    setBusyId(null);
    toast.success(INFO_SOURCES[source]);
    load();
  };

  const submitEtas = async (a: Application) => {
    const ref = (etasRefs[a.id] ?? "").trim();
    if (!ref) { toast.error("Enter the ETAS reference"); return; }
    if (!user) return;
    setBusyId(a.id);
    setApps(prev => prev.filter(app => app.id !== a.id));
    const { error } = await supabase.from("applications").update({
      etas_submitted: true,
      etas_reference: ref,
      etas_submitted_by: user.id,
      status: "submitted",
    }).eq("id", a.id);
    setBusyId(null);
    if (error) {
      load();
      toast.error(error.message);
    } else {
      toast.success("ETAS reference recorded");
      setTimeout(() => load(), 1500);
    }
  };

  const copy = async (label: string, value?: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Action required"
        title="Government submission queue"
        action={
          <div className="shrink-0 rounded-sm border border-warning/40 bg-warning/15 px-4 py-3 text-sm">
            <div className="text-[10px] uppercase tracking-wider text-warning">Pending</div>
            <div className="font-serif text-3xl text-foreground">{apps.length}</div>
          </div>
        }
        meta="Applications that are paid but have not yet been submitted to the government portal (ETAS). No application leaves this list until a reference number is recorded."
      />

      <div className="mt-6 rounded-sm border border-border bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-input bg-background px-3 py-1.5 text-sm sm:flex-none">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, reference, passport…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70 sm:w-56" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as "all" | "standard" | "express")} className="rounded-sm border border-input bg-background px-3 py-1.5 text-sm">
            <option value="all">All types</option>
            <option value="standard">Standard</option>
            <option value="express">Express</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
            <input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} className="rounded border-input" />
            Overdue only (&gt;24h)
          </label>
          {hasFilters && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1 text-[11px] uppercase tracking-wider text-muted-foreground hover:border-destructive hover:text-destructive">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
          <span className="ml-auto text-xs text-muted-foreground">{filteredApps.length} of {apps.length} shown</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {loading && (
          <div className="rounded-sm border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground shadow-card">Loading…</div>
        )}
        {!loading && filteredApps.length === 0 && (
          <div className="rounded-sm border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground shadow-card">
            {apps.length === 0 ? "All paid applications are submitted to the government portal. ✓" : "No applications match your filters."}
          </div>
        )}
        {filteredApps.map(a => {
          const h = ageHours(a);
          const overdue = h >= 24;
          const isBusy = busyId === a.id;
          const infoRequired = a.status === "additional_info";
          const docs = docsByApp[a.id] ?? [];
          return (
            <div key={a.id} className={`rounded-sm border bg-card shadow-card ${overdue ? "border-warning/50" : "border-border"}`}>
              <div className="flex items-start justify-between gap-4 px-6 pt-5">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">{a.full_name}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">DOB {new Date(a.dob).toLocaleDateString()}</div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <span className={`text-[10px] uppercase tracking-wider ${a.type === "express" ? "font-semibold text-accent" : "text-muted-foreground"}`}>{a.type}</span>
                  {a.paid
                    ? <span className="rounded-sm bg-success/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-success">✓ Paid</span>
                    : <span className="rounded-sm bg-warning/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground">Not paid</span>}
                  <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ${overdue ? "bg-warning/20 font-semibold text-warning" : "bg-secondary text-muted-foreground"}`}>
                    {overdue && <AlertTriangle className="h-3 w-3" />}
                    {h < 1 ? "<1h ago" : h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ${h % 24}h ago`}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 px-6 sm:grid-cols-3 lg:grid-cols-6">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Reference</dt>
                  <dd className="mt-0.5 font-mono text-xs"><Link to="/applications/$id" params={{ id: a.id }} className="text-primary hover:text-accent">{a.reference}</Link></dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Date Received</dt>
                  <dd className="mt-0.5 text-xs text-foreground">{new Date(a.paid_at ?? a.submitted_at).toLocaleString()}</dd>
                </div>
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
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Contact / WhatsApp</dt>
                  <dd className="mt-0.5 text-xs text-foreground">{a.email}</dd>
                  {a.phone && <dd className="text-[11px] text-muted-foreground">{a.phone}</dd>}
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Documents</dt>
                  <dd className="mt-1">
                    {docs.length === 0 ? (
                      <span className="text-xs text-destructive">Missing</span>
                    ) : (
                      <div>
                        <button
                          type="button"
                          onClick={() => setOpenDocs(s => ({ ...s, [a.id]: !s[a.id] }))}
                          className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-2 py-1 text-[10px] uppercase tracking-wider hover:border-accent hover:bg-accent-soft"
                        >
                          {openDocs[a.id] ? <FolderOpen className="h-3.5 w-3.5" /> : <Folder className="h-3.5 w-3.5" />}
                          {docs.length} file{docs.length !== 1 ? "s" : ""}
                        </button>
                        {openDocs[a.id] && (
                          <div className="mt-1.5 space-y-1">
                            {docs.map(d => (
                              <button
                                key={d.id}
                                onClick={() => downloadDoc(d)}
                                disabled={busyDoc === d.id}
                                className="flex w-full items-center gap-1.5 rounded-sm border border-border bg-card px-2 py-1 text-left text-[10px] uppercase tracking-wider hover:border-accent hover:bg-accent-soft disabled:opacity-60"
                              >
                                {busyDoc === d.id ? <Loader2 className="h-3 w-3 animate-spin shrink-0" /> : <Download className="h-3 w-3 shrink-0" />}
                                <span className="truncate">{docTypeLabels[d.doc_type as DocType]}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border px-6 py-4">
                <button
                  onClick={() => setViewing(a)}
                  className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2.5 py-1.5 text-[10px] uppercase tracking-wider hover:border-accent hover:bg-accent-soft"
                >
                  <Eye className="h-3 w-3" /> View & Docs
                </button>
                <Select
                  value={infoRequired ? "additional_info" : "awaiting_etas"}
                  onValueChange={async (val) => {
                    if (val === "awaiting_etas") {
                      const prev_status = a.status;
                      setBusyId(a.id);
                      setApps(prev => prev.map(app => app.id === a.id ? { ...app, status: "awaiting_etas" } : app));
                      const { error } = await supabase.from("applications").update({ status: "awaiting_etas" }).eq("id", a.id);
                      setBusyId(null);
                      if (error) { setApps(prev => prev.map(app => app.id === a.id ? { ...app, status: prev_status } : app)); toast.error(error.message); }
                      else { toast.success("Cleared info-required flag"); load(); }
                    } else {
                      setRejectingId(null);
                    }
                  }}
                  disabled={isBusy}
                >
                  <SelectTrigger className="h-8 w-36 text-[11px] uppercase tracking-wider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awaiting_etas">Pending</SelectItem>
                    <SelectItem value="additional_info" disabled>Info Required ▾</SelectItem>
                  </SelectContent>
                </Select>
                {!infoRequired && (
                  <button onClick={() => setInfoSource(a, "internal")} disabled={isBusy}
                    className="rounded-sm border border-amber-400/60 bg-amber-50 px-2 py-1.5 text-[10px] uppercase tracking-wider text-amber-700 hover:bg-amber-100 disabled:opacity-50">
                    Info — Us
                  </button>
                )}
                {infoRequired && (
                  <span className="rounded-sm bg-warning/20 px-2 py-1 text-[10px] uppercase tracking-wider text-warning">
                    Info Required — select source above
                  </span>
                )}
                <button
                  onClick={() => rejectApplication(a)}
                  disabled={isBusy}
                  className="inline-flex items-center gap-1 rounded-sm border border-destructive/40 bg-destructive/5 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  <XCircle className="h-3 w-3" /> {a.paid ? "Reject / Refund" : "Reject"}
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={() => deleteApplication(a)}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1 rounded-sm border border-destructive/60 bg-destructive/10 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-destructive hover:bg-destructive/20 disabled:opacity-50"
                    title="Permanently delete this application"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                )}
                <div className="ml-auto flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="ETAS reference number"
                    value={etasRefs[a.id] ?? ""}
                    onChange={(e) => setEtasRefs(prev => ({ ...prev, [a.id]: e.target.value }))}
                    className="w-44 rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs"
                  />
                  <button
                    onClick={() => submitEtas(a)}
                    disabled={isBusy || !(etasRefs[a.id] ?? "").trim()}
                    className="inline-flex items-center gap-1 rounded-sm bg-gradient-gold px-3 py-1.5 text-[11px] uppercase tracking-wider text-primary shadow-gold disabled:opacity-50"
                  >
                    {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    Submit to ETAS
                  </button>
                </div>
              </div>
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
                    <p className="mt-1">Applicant details were extracted from passport documents via OCR. Verify against uploaded files before processing.</p>
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
