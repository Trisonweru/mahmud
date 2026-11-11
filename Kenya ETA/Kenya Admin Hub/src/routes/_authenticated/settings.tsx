import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Check, X, KeyRound, Mail, UserCog, ShieldAlert, RotateCcw, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { PageShell, PageHeader } from "@/components/admin/PageShell";
import type { AppRole, Profile } from "@/lib/applications";
import type { Database } from "@/integrations/supabase/types";
import {
  inviteStaff,
  changeOwnEmail,
  changeOwnPassword,
  updateStaffAccount,
  resetStaffPassword,
  deleteStaffAccount,
  restoreStaffAccount,
} from "@/lib/staff.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: SettingsPage,
});

interface StaffRow extends Profile { roles: AppRole[]; }
type AuditRow = Database["public"]["Tables"]["account_audit_log"]["Row"];

const ROLE_LABEL: Record<AppRole, string> = { officer: "Officer", admin: "Admin", super_admin: "Super admin" };
const inputCls = "w-full rounded-sm border border-input bg-background px-3 py-2 text-sm";
const btnPrimary = "inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50";
const btnGhost = "inline-flex items-center gap-1.5 rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground disabled:opacity-50";
const PASSWORD_HINT = "At least 10 characters, with a letter and a number.";

const errMsg = (e: unknown, fallback: string) => {
  if (e instanceof Error) {
    // zod errors arrive as a JSON array of issues
    try { const j = JSON.parse(e.message); if (Array.isArray(j) && j[0]?.message) return j[0].message as string; } catch { /* plain message */ }
    return e.message;
  }
  return fallback;
};

const ACTION_LABEL: Record<string, string> = {
  account_invited: "Account invited",
  invite_accepted: "Invite accepted",
  own_password_changed: "Changed own password",
  own_email_changed: "Changed own login email",
  password_change_failed: "Password change failed",
  email_change_failed: "Email change failed",
  password_reset_requested: "Password reset requested",
  password_reset_completed: "Password reset completed",
  password_reset_link_sent: "Reset link sent by admin",
  password_set_by_admin: "Password set by admin",
  account_email_changed: "Login email changed",
  account_role_changed: "Role changed",
  account_details_updated: "Details updated",
  account_suspended: "Account suspended",
  account_reactivated: "Account reactivated",
  account_deleted: "Account deleted",
  account_restored: "Account restored",
};

function SettingsPage() {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin ? <SettingsContent /> : <AccessDenied requiredRole="super admin" />;
}

function SettingsContent() {
  const { profile, refresh } = useAuth();
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [managing, setManaging] = useState<string | null>(null);

  const load = async () => {
    const [{ data: profiles }, { data: roles }, { data: log }] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("account_audit_log").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    const byUser = new Map<string, AppRole[]>();
    ((roles ?? []) as { user_id: string; role: AppRole }[]).forEach(r => {
      const arr = byUser.get(r.user_id) ?? []; arr.push(r.role); byUser.set(r.user_id, arr);
    });
    setStaff(((profiles ?? []) as Profile[]).map(p => ({ ...p, roles: byUser.get(p.id) ?? [] })));
    setAudit((log ?? []) as AuditRow[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const reload = () => { load(); refresh(); };
  const live = useMemo(() => staff.filter(s => s.status !== "deleted"), [staff]);
  const deleted = useMemo(() => staff.filter(s => s.status === "deleted"), [staff]);
  const nameOf = (id: string | null) => staff.find(s => s.id === id)?.full_name || null;

  return (
    <PageShell className="max-w-5xl">
      <PageHeader eyebrow="Configuration" title="Settings" />

      <YourLogin email={profile?.email ?? ""} name={profile?.full_name ?? ""} onChanged={reload} />

      {/* Staff & access */}
      <div className="mt-6 rounded-sm border border-border bg-card p-6 shadow-card">
        <div className="font-serif text-xl text-foreground">Staff &amp; access</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage every Officer, Admin and Super Admin login: email, password, name, role, status and payroll details. All changes are recorded in the account activity log.
        </p>

        <InviteForm onInvited={load} />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 text-left">Name</th>
                <th className="py-2 text-left">Login email</th>
                <th className="py-2 text-left">Role</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Loading…</td></tr>}
              {live.map(s => (
                <StaffRowView
                  key={s.id}
                  s={s}
                  isSelf={s.id === profile?.id}
                  open={managing === s.id}
                  onToggle={() => setManaging(m => (m === s.id ? null : s.id))}
                  onChanged={reload}
                />
              ))}
            </tbody>
          </table>
        </div>

        {deleted.length > 0 && (
          <div className="mt-4">
            <button onClick={() => setShowDeleted(v => !v)} className="text-xs text-muted-foreground hover:text-foreground">
              {showDeleted ? "Hide" : "Show"} deleted accounts ({deleted.length})
            </button>
            {showDeleted && (
              <div className="mt-2 space-y-2">
                {deleted.map(s => (
                  <DeletedRow key={s.id} s={s} deletedByName={nameOf(s.deleted_by)} onRestored={reload} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payroll overview (edit via Manage) */}
      <div className="mt-6 rounded-sm border border-border bg-card p-6 shadow-card">
        <div className="font-serif text-xl text-foreground">Staff payroll profiles</div>
        <p className="mt-1 text-xs text-muted-foreground">Position, department, start date and contact for each staff member. Edit them with “Manage” above.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2 text-left">Name</th><th className="py-2 text-left">Phone</th><th className="py-2 text-left">Position</th><th className="py-2 text-left">Department</th><th className="py-2 text-left">Start date</th></tr>
            </thead>
            <tbody>
              {live.map(s => (
                <tr key={s.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2">{s.full_name || s.email}</td>
                  <td className="py-2 text-muted-foreground">{s.phone || "—"}</td>
                  <td className="py-2 text-muted-foreground">{s.position || "—"}</td>
                  <td className="py-2 text-muted-foreground">{s.department || "—"}</td>
                  <td className="py-2 text-muted-foreground">{s.start_date ? new Date(s.start_date).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit log */}
      <div className="mt-6 rounded-sm border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 font-serif text-xl text-foreground"><History className="h-5 w-5 text-accent" /> Account activity log</div>
        <p className="mt-1 text-xs text-muted-foreground">Every login-credential and account change (last 100). Entries cannot be edited or removed.</p>
        <div className="mt-4 max-h-[420px] overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 border-b border-border bg-card text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2 text-left">When</th><th className="py-2 text-left">Action</th><th className="py-2 text-left">Account</th><th className="py-2 text-left">By</th><th className="py-2 text-left">Details</th></tr>
            </thead>
            <tbody>
              {audit.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No activity recorded yet.</td></tr>}
              {audit.map(a => (
                <tr key={a.id} className="border-b border-border/60 align-top last:border-0">
                  <td className="whitespace-nowrap py-2 pr-3 text-muted-foreground">{new Date(a.created_at).toLocaleString()}</td>
                  <td className={`py-2 pr-3 font-medium ${a.action.includes("failed") || a.action === "account_deleted" || a.action === "account_suspended" ? "text-destructive" : "text-foreground"}`}>
                    {ACTION_LABEL[a.action] ?? a.action}
                  </td>
                  <td className="py-2 pr-3">{a.target_email ?? "—"}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{a.actor_id ? (a.actor_email ?? "—") : "Self-service"}</td>
                  <td className="py-2 text-muted-foreground"><AuditDetails details={a.details} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SMS placeholder */}
      <div className="mt-6 rounded-sm border border-dashed border-border bg-secondary/30 p-6 text-sm">
        <div className="font-serif text-lg text-foreground">SMS notifications</div>
        <p className="mt-1 text-xs text-muted-foreground">In-app notifications are live. To also receive SMS alerts on payment / submission, connect a Twilio account and provide API credentials.</p>
      </div>
    </PageShell>
  );
}

// ── Your login (2.1) ───────────────────────────────────────────────────────

function YourLogin({ email, name, onChanged }: { email: string; name: string; onChanged: () => void }) {
  const [panel, setPanel] = useState<"none" | "email" | "password">("none");
  const [busy, setBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const doEmail = useServerFn(changeOwnEmail);
  const doPassword = useServerFn(changeOwnPassword);

  const close = () => { setPanel("none"); setCurrentPassword(""); setNewEmail(""); setNewPassword(""); setConfirmPassword(""); };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await doEmail({ data: { currentPassword, newEmail } });
      toast.success(`Login email changed to ${r.email}`);
      close(); onChanged();
    } catch (err) { toast.error(errMsg(err, "Could not change email")); }
    finally { setBusy(false); }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("New passwords do not match"); return; }
    setBusy(true);
    try {
      await doPassword({ data: { currentPassword, newPassword } });
      toast.success("Password changed");
      close(); onChanged();
    } catch (err) { toast.error(errMsg(err, "Could not change password")); }
    finally { setBusy(false); }
  };

  return (
    <div className="mt-8 rounded-sm border border-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-serif text-xl text-foreground">Your login</div>
          <div className="mt-3 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Pair label="Name" value={name || "—"} />
            <Pair label="Login email" value={email || "—"} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPanel(p => (p === "email" ? "none" : "email"))} className={btnGhost}><Mail className="h-3.5 w-3.5" /> Change email</button>
          <button onClick={() => setPanel(p => (p === "password" ? "none" : "password"))} className={btnGhost}><KeyRound className="h-3.5 w-3.5" /> Change password</button>
        </div>
      </div>

      {panel === "email" && (
        <form onSubmit={submitEmail} className="mt-5 grid gap-3 rounded-sm border border-accent/30 bg-accent/5 p-4 sm:grid-cols-2">
          <Labeled label="New login email">
            <input required type="email" autoComplete="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className={inputCls} />
          </Labeled>
          <Labeled label="Current password (to confirm it's you)">
            <input required type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputCls} />
          </Labeled>
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={busy} className={btnPrimary}><Check className="h-3.5 w-3.5" /> {busy ? "Saving…" : "Update email"}</button>
            <button type="button" onClick={close} className={btnGhost}><X className="h-3.5 w-3.5" /> Cancel</button>
          </div>
        </form>
      )}

      {panel === "password" && (
        <form onSubmit={submitPassword} className="mt-5 grid gap-3 rounded-sm border border-accent/30 bg-accent/5 p-4 sm:grid-cols-3">
          <Labeled label="Current password">
            <input required type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputCls} />
          </Labeled>
          <Labeled label="New password">
            <input required type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputCls} />
          </Labeled>
          <Labeled label="Confirm new password">
            <input required type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputCls} />
          </Labeled>
          <p className="text-[11px] text-muted-foreground sm:col-span-3">{PASSWORD_HINT} Forgot your current password? Sign out and use “Forgot password?” on the sign-in page.</p>
          <div className="flex gap-2 sm:col-span-3">
            <button disabled={busy} className={btnPrimary}><Check className="h-3.5 w-3.5" /> {busy ? "Saving…" : "Update password"}</button>
            <button type="button" onClick={close} className={btnGhost}><X className="h-3.5 w-3.5" /> Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Invite ─────────────────────────────────────────────────────────────────

function InviteForm({ onInvited }: { onInvited: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AppRole>("officer");
  const [busy, setBusy] = useState(false);
  const invite = useServerFn(inviteStaff);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await invite({ data: { email, full_name: name, role } });
      toast.success(`Invitation sent to ${email}`);
      setEmail(""); setName(""); setRole("officer");
      onInvited();
    } catch (err) { toast.error(errMsg(err, "Failed to invite")); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="mt-4 rounded-sm border border-accent/30 bg-accent/5 p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-accent">Invite new staff</div>
      <p className="mt-1 text-xs text-muted-foreground">The recipient will receive an email with a link to set their password.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <input required type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
        <input required type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} className={`${inputCls} sm:col-span-2`} />
        <select value={role} onChange={e => setRole(e.target.value as AppRole)} className={inputCls}>
          <option value="officer">Officer</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super admin</option>
        </select>
      </div>
      <button type="submit" disabled={busy} className={`mt-3 ${btnPrimary}`}>{busy ? "Sending…" : "Send invitation"}</button>
    </form>
  );
}

// ── Staff row + manage panel (2.2) ─────────────────────────────────────────

function StaffRowView({ s, isSelf, open, onToggle, onChanged }: {
  s: StaffRow; isSelf: boolean; open: boolean; onToggle: () => void; onChanged: () => void;
}) {
  const role = s.roles[0];
  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="py-3">{s.full_name || "—"}{isSelf && <span className="ml-2 text-[10px] uppercase tracking-wider text-accent">You</span>}</td>
        <td className="py-3 text-muted-foreground">{s.email}</td>
        <td className="py-3">{role ? ROLE_LABEL[role] : <span className="text-muted-foreground">No role</span>}</td>
        <td className="py-3"><StatusBadge status={s.status} /></td>
        <td className="py-3 text-right">
          <button onClick={onToggle} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
            {open ? <><X className="h-3.5 w-3.5" /> Close</> : <><UserCog className="h-3.5 w-3.5" /> Manage</>}
          </button>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-border bg-secondary/30">
          <td colSpan={5} className="p-4">
            <ManagePanel s={s} isSelf={isSelf} onChanged={onChanged} onClose={onToggle} />
          </td>
        </tr>
      )}
    </>
  );
}

function ManagePanel({ s, isSelf, onChanged, onClose }: { s: StaffRow; isSelf: boolean; onChanged: () => void; onClose: () => void }) {
  const update = useServerFn(updateStaffAccount);
  const reset = useServerFn(resetStaffPassword);
  const del = useServerFn(deleteStaffAccount);

  const [draft, setDraft] = useState({
    full_name: s.full_name ?? "",
    email: s.email ?? "",
    role: (s.roles[0] ?? "officer") as AppRole,
    status: (s.status === "suspended" ? "suspended" : "active") as "active" | "suspended",
    phone: s.phone ?? "",
    position: s.position ?? "",
    department: s.department ?? "",
    start_date: s.start_date ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft(d => ({ ...d, [k]: v }));

  const save = async () => {
    if (draft.status === "suspended" && s.status !== "suspended" &&
        !window.confirm(`Suspend ${s.full_name || s.email}? They will be signed out and blocked from logging in until reactivated.`)) return;
    setBusy(true);
    try {
      const r = await update({ data: {
        userId: s.id,
        full_name: draft.full_name,
        ...(isSelf ? {} : { email: draft.email, role: draft.role, status: draft.status }),
        phone: draft.phone || null,
        position: draft.position || null,
        department: draft.department || null,
        start_date: draft.start_date || null,
      } });
      toast.success(r.changed.length ? "Account updated" : "No changes to save");
      onChanged();
    } catch (err) { toast.error(errMsg(err, "Could not update account")); }
    finally { setBusy(false); }
  };

  const sendReset = async () => {
    setBusy(true);
    try { await reset({ data: { userId: s.id, method: "email" } }); toast.success(`Password reset link emailed to ${s.email}`); onChanged(); }
    catch (err) { toast.error(errMsg(err, "Could not send reset link")); }
    finally { setBusy(false); }
  };

  const setPassword = async () => {
    setBusy(true);
    try {
      await reset({ data: { userId: s.id, method: "set", password: tempPassword } });
      toast.success("Password changed. Share it with the user securely and ask them to change it.");
      setTempPassword(""); onChanged();
    } catch (err) { toast.error(errMsg(err, "Could not set password")); }
    finally { setBusy(false); }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await del({ data: { userId: s.id, confirmEmail: deleteEmail, reason: deleteReason } });
      toast.success(`${s.email} deleted. The record and history are kept and it can be restored.`);
      onClose(); onChanged();
    } catch (err) { toast.error(errMsg(err, "Could not delete account")); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5 text-left">
      {/* Details */}
      <section>
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent">Account details</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-4">
          <Labeled label="Full name"><input value={draft.full_name} onChange={e => set("full_name", e.target.value)} className={inputCls} /></Labeled>
          <Labeled label="Login email">
            <input type="email" value={draft.email} disabled={isSelf} onChange={e => set("email", e.target.value)} className={inputCls}
              title={isSelf ? "Use “Change email” under Your login" : undefined} />
          </Labeled>
          <Labeled label="Role">
            <select value={draft.role} disabled={isSelf} onChange={e => set("role", e.target.value as AppRole)} className={inputCls}>
              <option value="officer">Officer</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </select>
          </Labeled>
          <Labeled label="Status">
            <select value={draft.status} disabled={isSelf} onChange={e => set("status", e.target.value as "active" | "suspended")} className={inputCls}>
              <option value="active">Active</option>
              <option value="suspended">Suspended (cannot log in)</option>
            </select>
          </Labeled>
          <Labeled label="Phone"><input value={draft.phone} onChange={e => set("phone", e.target.value)} className={inputCls} placeholder="+252 61 000 0000" /></Labeled>
          <Labeled label="Position / Title"><input value={draft.position} onChange={e => set("position", e.target.value)} className={inputCls} placeholder="e.g. Visa Officer" /></Labeled>
          <Labeled label="Department"><input value={draft.department} onChange={e => set("department", e.target.value)} className={inputCls} placeholder="e.g. Operations" /></Labeled>
          <Labeled label="Start date"><input type="date" value={draft.start_date} onChange={e => set("start_date", e.target.value)} className={inputCls} /></Labeled>
        </div>
        {isSelf && <p className="mt-2 text-[11px] text-muted-foreground">You can't change your own role or status. Change your own email and password under “Your login”.</p>}
        <button onClick={save} disabled={busy} className={`mt-3 ${btnPrimary}`}><Pencil className="h-3.5 w-3.5" /> Save changes</button>
      </section>

      {/* Password */}
      {!isSelf && (
        <section className="border-t border-border pt-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-accent">Password</div>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <button onClick={sendReset} disabled={busy} className={btnGhost}><Mail className="h-3.5 w-3.5" /> Email reset link</button>
            <span className="text-xs text-muted-foreground">or set a new password:</span>
            <input type="text" autoComplete="off" value={tempPassword} onChange={e => setTempPassword(e.target.value)} placeholder="New password" className={`${inputCls} max-w-[220px]`} />
            <button onClick={setPassword} disabled={busy || !tempPassword} className={btnGhost}><KeyRound className="h-3.5 w-3.5" /> Set password</button>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">{PASSWORD_HINT} The reset link is the safer option: you never see the user's password.</p>
        </section>
      )}

      {/* Delete */}
      {!isSelf && (
        <section className="border-t border-border pt-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-destructive">Delete account</div>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="mt-2 inline-flex items-center gap-1.5 rounded-sm border border-destructive/40 px-4 py-2 text-xs uppercase tracking-wider text-destructive hover:bg-destructive/5">
              <ShieldAlert className="h-3.5 w-3.5" /> Delete this account…
            </button>
          ) : (
            <div className="mt-2 rounded-sm border border-destructive/40 bg-destructive/5 p-4">
              <p className="text-xs text-foreground">
                This blocks <strong>{s.email}</strong> from logging in and removes their access. The account record and its full history are kept for audit and it can be restored later.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Labeled label={`Type ${s.email} to confirm`}>
                  <input value={deleteEmail} onChange={e => setDeleteEmail(e.target.value)} className={inputCls} autoComplete="off" />
                </Labeled>
                <Labeled label="Reason (recorded in the log)">
                  <input value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className={inputCls} placeholder="e.g. Left the organisation" />
                </Labeled>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={doDelete}
                  disabled={busy || deleteEmail.trim().toLowerCase() !== (s.email ?? "").toLowerCase() || deleteReason.trim().length < 3}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-destructive px-4 py-2 text-xs uppercase tracking-wider text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40"
                >
                  <ShieldAlert className="h-3.5 w-3.5" /> Confirm delete
                </button>
                <button onClick={() => { setConfirmDelete(false); setDeleteEmail(""); setDeleteReason(""); }} className={btnGhost}>Cancel</button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function DeletedRow({ s, deletedByName, onRestored }: { s: StaffRow; deletedByName: string | null; onRestored: () => void }) {
  const restore = useServerFn(restoreStaffAccount);
  const [role, setRole] = useState<AppRole>("officer");
  const [busy, setBusy] = useState(false);
  const doRestore = async () => {
    setBusy(true);
    try { await restore({ data: { userId: s.id, role } }); toast.success(`${s.email} restored as ${ROLE_LABEL[role]}`); onRestored(); }
    catch (err) { toast.error(errMsg(err, "Could not restore account")); }
    finally { setBusy(false); }
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-secondary/30 px-4 py-3 text-xs">
      <div>
        <div className="font-medium text-foreground">{s.full_name || "—"} <span className="text-muted-foreground">· {s.email}</span></div>
        <div className="text-muted-foreground">
          Deleted {s.deleted_at ? new Date(s.deleted_at).toLocaleString() : ""}{deletedByName ? ` by ${deletedByName}` : ""}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select value={role} onChange={e => setRole(e.target.value as AppRole)} className="rounded-sm border border-input bg-background px-2 py-1 text-xs">
          <option value="officer">Officer</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super admin</option>
        </select>
        <button onClick={doRestore} disabled={busy} className="inline-flex items-center gap-1 rounded-sm border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50">
          <RotateCcw className="h-3 w-3" /> Restore
        </button>
      </div>
    </div>
  );
}

// ── small bits ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cls = status === "active" ? "border-success/40 text-success" : status === "suspended" ? "border-warning/50 text-warning" : "border-destructive/40 text-destructive";
  return <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}>{status}</span>;
}

function AuditDetails({ details }: { details: unknown }) {
  if (!details || typeof details !== "object") return <>—</>;
  const d = details as Record<string, unknown>;
  const parts: string[] = [];
  if (d.changes && typeof d.changes === "object") {
    for (const [k, v] of Object.entries(d.changes as Record<string, { from: unknown; to: unknown }>)) {
      parts.push(`${k.replace("_", " ")}: ${v.from ?? "—"} → ${v.to ?? "—"}`);
    }
  }
  if (d.from && d.to) parts.push(`${d.from} → ${d.to}`);
  if (d.role) parts.push(`role: ${d.role}`);
  if (d.reason) parts.push(`reason: ${d.reason}`);
  if (d.error) parts.push(`error: ${d.error}`);
  return <>{parts.length ? parts.join(" · ") : "—"}</>;
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-foreground">{value}</div>
    </div>
  );
}
