import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Mail, MapPin, Calendar, Shield, User, Briefcase,
  MessageSquare, FileText, Loader2, Trash2, Eye, History,
  AlertTriangle, RotateCcw, DollarSign, ChevronDown, ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DocumentsList } from "@/components/admin/DocumentsList";
import { ALL_STATUSES, statusLabels, type AppNote, type AppStatus, type Application } from "@/lib/applications";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/applications/$id")({
  head: ({ params }) => ({ meta: [{ title: `Application ${params.id} — Admin` }] }),
  component: ApplicationDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-serif text-3xl">Application not found</h1>
      <Link to="/applications" className="mt-4 inline-block text-sm text-accent">← Back to applications</Link>
    </div>
  ),
});

const AUDIT_PREFIX = "__AUDIT__ ";

function ApplicationDetail() {
  const { id } = Route.useParams();
  const { user, profile, isAdmin, isSuperAdmin } = useAuth();
  const nav = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState<AppNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [etasRef, setEtasRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  // Concurrent viewers via Supabase Presence
  const [viewers, setViewers] = useState<{ name: string }[]>([]);
  const presenceRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
    if (error) { toast.error(error.message); return; }
    if (!data) throw notFound();
    setApp(data as Application);
    setEtasRef(data.etas_reference ?? "");
    // Join profiles to resolve author names in the audit log (#18)
    const { data: ns } = await supabase
      .from("application_notes")
      .select("*, profiles(full_name)")
      .eq("application_id", id)
      .order("created_at", { ascending: false });
    setNotes((ns ?? []) as (AppNote & { profiles: { full_name: string } | null })[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  // ── Supabase Presence — concurrent viewer detection ──────────────────────
  useEffect(() => {
    if (!user?.id || !profile?.full_name) return;
    const ch = supabase.channel(`viewing:${id}`, { config: { presence: { key: user.id } } });
    presenceRef.current = ch;
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<{ name: string }>();
      const others = Object.entries(state)
        .filter(([key]) => key !== user.id)
        .flatMap(([, presence]) => presence);
      setViewers(others);
    });
    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({ name: profile.full_name });
      }
    });
    return () => { supabase.removeChannel(ch); };
  }, [id, user?.id, profile?.full_name]);

  if (loading) return <div className="container mx-auto px-6 py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!app) return null;

  // Lock all write actions if another officer is actively viewing (super admin can override)
  const isLocked = viewers.length > 0 && !isSuperAdmin;

  const regularNotes = notes.filter(n => !n.body.startsWith(AUDIT_PREFIX));
  const auditLog     = notes.filter(n =>  n.body.startsWith(AUDIT_PREFIX));

  const update = async (patch: Partial<Application>) => {
    setBusy(true);
    const { error } = await supabase.from("applications").update(patch).eq("id", app.id);
    setBusy(false);
    if (error) { toast.error(error.message); return false; }
    toast.success("Updated");
    await load();
    return true;
  };

  const setStatus = async (s: AppStatus) => {
    const prev = app.status;
    const ok = await update({ status: s });
    if (ok && user) {
      await supabase.from("application_notes").insert({
        application_id: app.id,
        author_id: user.id,
        body: `${AUDIT_PREFIX}Status changed: ${statusLabels[prev]} → ${statusLabels[s]}`,
      });
      await load();
    }
  };

  const markPaid = () => update({ paid: true });

  const submitEtas = async () => {
    if (!etasRef.trim()) { toast.error("Enter the government reference number"); return; }
    if (!user) return;
    await update({ etas_submitted: true, etas_reference: etasRef.trim(), etas_submitted_by: user.id, status: "in_review" });
  };

  const approve = async () => {
    if (!app.etas_submitted || !app.etas_reference) {
      toast.error("Submit to government portal (ETAS) before approving");
      return;
    }
    await setStatus("approved");
  };

  const reject = () => setStatus("rejected");

  const superAdminOverride = async (s: AppStatus) => {
    if (!isSuperAdmin) return;
    if (!confirm(`Override status to "${statusLabels[s]}" for ${app.reference}? This bypasses normal workflow rules.`)) return;
    await setStatus(s);
  };

  const deleteApp = async () => {
    if (!confirm(`Permanently delete ${app.reference}? All documents and notes will be removed. This cannot be undone.`)) return;
    setBusy(true);
    const { data: docPaths } = await supabase.from("application_documents").select("storage_path").eq("application_id", app.id);
    if (docPaths?.length) await supabase.storage.from("application-documents").remove(docPaths.map(d => d.storage_path));
    await supabase.from("application_documents").delete().eq("application_id", app.id);
    await supabase.from("application_notes").delete().eq("application_id", app.id);
    const { error } = await supabase.from("applications").delete().eq("id", app.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Application deleted");
    nav({ to: "/applications" });
  };

  const addNote = async () => {
    if (!noteText.trim() || !user) return;
    setBusy(true);
    await supabase.from("application_notes").insert({ application_id: app.id, author_id: user.id, body: noteText.trim() });
    setBusy(false);
    setNoteText(""); load();
  };

  const requestRefund = async () => {
    if (!refundReason.trim()) { toast.error("Enter a refund reason"); return; }
    if (!user) return;
    const amount = refundAmount ? parseFloat(refundAmount) : null;
    const ok = await update({
      refund_requested_at: new Date().toISOString(),
      refund_requested_by: user.id,
      refund_reason: refundReason.trim(),
      refund_status: "requested",
      refund_amount: amount,
    });
    if (ok) {
      await supabase.from("application_notes").insert({
        application_id: app.id,
        author_id: user.id,
        body: `${AUDIT_PREFIX}Refund requested${amount ? ` · $${amount}` : ""} — ${refundReason.trim()}`,
      });
      setShowRefund(false); setRefundReason(""); setRefundAmount("");
      await load();
    }
  };

  const updateRefundStatus = async (status: "approved" | "rejected" | "processed") => {
    if (!user) return;
    const ok = await update({ refund_status: status });
    if (ok) {
      await supabase.from("application_notes").insert({
        application_id: app.id,
        author_id: user.id,
        body: `${AUDIT_PREFIX}Refund ${status}`,
      });
      await load();
    }
  };

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/applications" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to applications
      </Link>

      {/* Concurrent viewer banner */}
      {viewers.length > 0 && (
        <div className={`mt-4 flex items-center gap-2 rounded-sm border px-4 py-3 text-sm ${
          isLocked
            ? "border-destructive/50 bg-destructive/10 text-destructive"
            : "border-warning/50 bg-warning/10 text-foreground"
        }`}>
          <Eye className="h-4 w-4 shrink-0" />
          <span>
            <strong>{viewers.map(v => v.name).join(", ")}</strong>
            {viewers.length === 1 ? " is" : " are"} currently processing this application.
            {isLocked ? " All edits are locked until they leave." : " Super admin override is active."}
          </span>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-mono text-xs text-accent">{app.reference}</div>
          <h1 className="mt-2 font-serif text-4xl text-foreground">{app.full_name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{app.nationality} passport</span>
            <span>·</span>
            <span className="capitalize">{app.type} processing</span>
            <span>·</span>
            <StatusBadge status={app.status} />
            {app.etas_submitted && <span className="rounded-sm bg-success/15 px-2 py-0.5 text-[11px] uppercase tracking-wider text-success">Gov. submitted: {app.etas_reference}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <>
              {!app.paid && <button onClick={markPaid} disabled={busy || isLocked} className="rounded-sm border border-border bg-card px-4 py-2 text-xs uppercase tracking-wider hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed">Mark as paid</button>}
              <button onClick={reject} disabled={busy || isLocked} className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-2 text-xs uppercase tracking-wider text-destructive hover:bg-destructive/15 disabled:opacity-50 disabled:cursor-not-allowed">Reject</button>
              <button onClick={approve} disabled={busy || isLocked} className="rounded-sm bg-gradient-navy px-4 py-2 text-xs uppercase tracking-wider text-primary-foreground shadow-card hover:shadow-elegant disabled:opacity-60 disabled:cursor-not-allowed">Approve &amp; issue eVisa</button>
            </>
          )}
          {isSuperAdmin && (
            <button onClick={deleteApp} disabled={busy} className="inline-flex items-center gap-1.5 rounded-sm border border-destructive/50 bg-destructive/10 px-4 py-2 text-xs uppercase tracking-wider text-destructive hover:bg-destructive/20 disabled:opacity-60">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {app.type === "express" && (
            <div className="rounded-sm border border-accent/30 bg-accent/5 px-5 py-3 text-xs text-muted-foreground">
              <span className="font-semibold text-accent uppercase tracking-wider text-[10px]">Express application</span>
              <p className="mt-1">Details below were extracted from uploaded passport documents via OCR. Verify against the uploaded files before processing.</p>
            </div>
          )}

          <Section title="Personal information" icon={User}>
            <Field label={app.type === "express" ? "Name (from passport)" : "Full legal name"} value={app.full_name} />
            <Field label="Date of birth" value={new Date(app.dob).toLocaleDateString()} />
            <Field label="Nationality" value={app.nationality} />
            <Field label="Email" value={app.email} icon={Mail} />
            {app.phone && <Field label="Contact / WhatsApp" value={app.phone} />}
            <Field label="Passport number" value={app.passport_number} />
            <Field label="Passport expiry" value={new Date(app.passport_expiry).toLocaleDateString()} />
          </Section>

          {app.type === "standard" && app.purpose && (
            <Section title="Travel details" icon={Briefcase}>
              <Field label="Purpose" value={app.purpose} />
              {app.address_in_somalia && <Field label="Address in Somalia" value={app.address_in_somalia} icon={MapPin} />}
              {app.arrival_date && <Field label="Arrival" value={new Date(app.arrival_date).toLocaleDateString()} icon={Calendar} />}
              {app.departure_date && <Field label="Departure" value={new Date(app.departure_date).toLocaleDateString()} icon={Calendar} />}
            </Section>
          )}

          <div className="rounded-sm border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              <div className="font-serif text-xl text-foreground">Uploaded documents</div>
            </div>
            <div className="mt-5"><DocumentsList applicationId={app.id} /></div>
          </div>

          {/* Internal notes */}
          <Section title="Internal notes" icon={MessageSquare}>
            <div className="col-span-2 space-y-3">
              {regularNotes.length === 0 && <div className="text-xs text-muted-foreground">No notes yet.</div>}
              {regularNotes.map(n => {
                const entry = n as AppNote & { profiles?: { full_name: string } | null };
                return (
                  <div key={n.id} className="rounded-sm border border-border bg-secondary/40 p-4 text-sm">
                    <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                      {entry.profiles?.full_name && <span className="font-medium">{entry.profiles.full_name}</span>}
                    </div>
                    <p className="mt-1 text-foreground whitespace-pre-wrap">{n.body}</p>
                  </div>
                );
              })}
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note for the case file…" className="min-h-[90px] w-full rounded-sm border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
              <div className="text-right">
                <button onClick={addNote} disabled={busy || isLocked || !noteText.trim()} className="rounded-sm bg-primary px-4 py-2 text-xs uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed">Save note</button>
              </div>
            </div>
          </Section>

          {/* Audit history */}
          <div className="rounded-sm border border-border bg-card p-6 shadow-card">
            <button onClick={() => setShowHistory(h => !h)} className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-accent" />
                <div className="font-serif text-xl text-foreground">Change history</div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{auditLog.length}</span>
              </div>
              {showHistory ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {showHistory && (
              <div className="mt-4 space-y-2">
                {auditLog.length === 0 && <div className="text-xs text-muted-foreground">No history yet.</div>}
                {auditLog.map(n => {
                  const entry = n as AppNote & { profiles?: { full_name: string } | null };
                  return (
                    <div key={n.id} className="flex items-start gap-3 text-xs">
                      <span className="whitespace-nowrap text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                      <span className="text-foreground">{n.body.replace(AUDIT_PREFIX, "")}</span>
                      {entry.profiles?.full_name && (
                        <span className="ml-auto shrink-0 whitespace-nowrap font-medium text-muted-foreground">{entry.profiles.full_name}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          {/* ETAS card — hidden for denied/refunded applications */}
          {(app.status === "rejected" || (app.refund_status !== null && app.refund_status !== undefined)) && !app.etas_submitted ? (
            <div className="rounded-sm border border-border bg-card p-6 shadow-card">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Government portal (ETAS)</div>
              <div className="font-serif text-xl text-muted-foreground">Not applicable</div>
              <p className="mt-2 text-xs text-muted-foreground">
                {app.status === "rejected" ? "Application was denied — ETAS submission is not required." : "Refund in progress — ETAS submission is blocked."}
              </p>
            </div>
          ) : (
          <div className={`rounded-sm border p-6 shadow-card ${!app.etas_submitted && app.paid ? "border-warning bg-warning/10" : "border-border bg-card"}`}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Government portal (ETAS)</div>
            <div className="font-serif text-xl text-foreground">{app.etas_submitted ? "Submitted ✓" : "Not yet submitted"}</div>
            {app.etas_submitted ? (
              <>
                <div className="mt-3 text-sm">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Reference</div>
                  <div className="font-mono text-foreground">{app.etas_reference}</div>
                </div>
                {app.etas_submitted_at && <div className="mt-2 text-[11px] text-muted-foreground">{new Date(app.etas_submitted_at).toLocaleString()}</div>}
              </>
            ) : (
              <>
                <p className="mt-2 text-xs text-foreground">After applying via the government portal, paste the reference number here.</p>
                <input value={etasRef} onChange={(e) => setEtasRef(e.target.value)} placeholder="ETAS-XXXX-XXXX" className="mt-3 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
                <button onClick={submitEtas} disabled={busy || isLocked || !etasRef.trim() || !app.paid} className="mt-3 w-full rounded-sm bg-gradient-gold px-3 py-2 text-xs uppercase tracking-wider text-primary shadow-gold disabled:opacity-60 disabled:cursor-not-allowed">
                  Mark as submitted to gov. portal
                </button>
                {!app.paid && <p className="mt-2 text-[11px] text-warning">Awaiting payment — cannot submit until paid.</p>}
              </>
            )}
          </div>
          )}

          {/* Status workflow */}
          <div className="rounded-sm border border-border bg-card p-6 shadow-card">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Workflow</div>
            <div className="font-serif text-xl text-foreground">Status</div>
            <div className="mt-4 space-y-2">
              {ALL_STATUSES.map(t => (
                <button key={t} onClick={() => isAdmin && !isLocked && setStatus(t)} disabled={busy || !isAdmin || isLocked}
                  title={!isAdmin ? "Admin access required" : undefined}
                  className={`w-full rounded-sm border px-3 py-2 text-left text-sm transition-colors ${app.status === t ? "border-accent bg-accent-soft text-foreground" : "border-border"} ${isAdmin ? "hover:border-accent/50" : "cursor-default opacity-70"}`}>
                  {statusLabels[t]}
                </button>
              ))}
            </div>
            {!isAdmin && <p className="mt-3 text-[11px] text-muted-foreground">Status changes require admin access.</p>}
          </div>

          {/* Super-admin override */}
          {isSuperAdmin && (
            <div className="rounded-sm border border-accent/30 bg-accent/5 p-6 shadow-card">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-accent">
                <AlertTriangle className="h-3.5 w-3.5" /> Super Admin Override
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Force any status, bypassing ETAS and payment requirements.</p>
              <div className="mt-3 space-y-2">
                {ALL_STATUSES.map(t => (
                  <button key={t} onClick={() => superAdminOverride(t)} disabled={busy || app.status === t}
                    className="w-full rounded-sm border border-accent/30 px-3 py-2 text-left text-xs uppercase tracking-wider hover:bg-accent/10 disabled:opacity-40">
                    → {statusLabels[t]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment card */}
          <div className="rounded-sm border border-border bg-card p-6 shadow-card">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Payment</div>
            <div className="font-serif text-xl text-foreground">${Number(app.fee)} USD</div>
            <div className="mt-2 text-sm text-muted-foreground">{app.type === "express" ? "Express service" : "Standard processing"}</div>
            <div className="mt-3">
              {app.paid ? (
                <span className="inline-flex items-center rounded-sm bg-success/15 px-2.5 py-1 text-[11px] uppercase tracking-wider text-success">
                  Paid {app.paid_at ? `· ${new Date(app.paid_at).toLocaleDateString()}` : ""}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-sm bg-warning/20 px-2.5 py-1 text-[11px] uppercase tracking-wider text-foreground">Awaiting payment</span>
              )}
            </div>

            {/* Refund section */}
            {app.paid && isAdmin && (
              <div className="mt-4 border-t border-border pt-4">
                {app.refund_status ? (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Refund status</div>
                    <div className={`mt-1 text-sm font-medium capitalize ${
                      app.refund_status === "processed" ? "text-success" :
                      app.refund_status === "rejected"  ? "text-destructive" : "text-foreground"
                    }`}>{app.refund_status}{app.refund_amount ? ` · $${app.refund_amount}` : ""}</div>
                    {app.refund_reason && <p className="mt-1 text-xs text-muted-foreground">{app.refund_reason}</p>}
                    {app.refund_status === "requested" && isSuperAdmin && (
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => updateRefundStatus("approved")} disabled={busy}
                          className="flex-1 rounded-sm bg-success/20 px-3 py-1.5 text-xs uppercase tracking-wider text-success hover:bg-success/30 disabled:opacity-60">Approve</button>
                        <button onClick={() => updateRefundStatus("rejected")} disabled={busy}
                          className="flex-1 rounded-sm bg-destructive/10 px-3 py-1.5 text-xs uppercase tracking-wider text-destructive hover:bg-destructive/20 disabled:opacity-60">Reject</button>
                      </div>
                    )}
                    {app.refund_status === "approved" && isSuperAdmin && (
                      <button onClick={() => updateRefundStatus("processed")} disabled={busy}
                        className="mt-2 w-full rounded-sm bg-primary px-3 py-1.5 text-xs uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-60">Mark as processed</button>
                    )}
                  </div>
                ) : (
                  <>
                    {!showRefund ? (
                      <button onClick={() => setShowRefund(true)}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
                        <RotateCcw className="h-3.5 w-3.5" /> Request refund
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-wider text-destructive flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> Refund request
                        </div>
                        <input value={refundAmount} onChange={e => setRefundAmount(e.target.value)} placeholder={`Amount (max $${app.fee})`} type="number" min="1" max={String(app.fee)}
                          className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
                        <textarea value={refundReason} onChange={e => setRefundReason(e.target.value)} placeholder="Reason for refund…" rows={2}
                          className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
                        <div className="flex gap-2">
                          <button onClick={requestRefund} disabled={busy || !refundReason.trim()}
                            className="flex-1 rounded-sm bg-destructive/80 px-3 py-1.5 text-xs uppercase tracking-wider text-white hover:bg-destructive disabled:opacity-60">Submit</button>
                          <button onClick={() => { setShowRefund(false); setRefundReason(""); setRefundAmount(""); }}
                            className="rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="rounded-sm border border-border bg-card p-6 shadow-card">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Submitted</div>
            <div className="text-sm text-foreground">{new Date(app.submitted_at).toLocaleString()}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-accent" /><div className="font-serif text-xl text-foreground">{title}</div></div>
      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {value}
      </div>
    </div>
  );
}
