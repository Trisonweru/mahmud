import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { PageShell, PageHeader } from "@/components/admin/PageShell";
import type { AppRole, Profile } from "@/lib/applications";
import { inviteStaff, deleteStaff } from "@/lib/staff.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: SettingsPage,
});

interface StaffRow extends Profile { roles: AppRole[]; }

function SettingsPage() {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin ? <SettingsContent /> : <AccessDenied requiredRole="super admin" />;
}

function SettingsContent() {
  const { isSuperAdmin, profile, refresh } = useAuth();
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("officer");
  const [inviting, setInviting] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<string | null>(null);
  const [payrollDraft, setPayrollDraft] = useState<{ phone: string; position: string; department: string; start_date: string }>({
    phone: "", position: "", department: "", start_date: "",
  });
  const invite = useServerFn(inviteStaff);
  const deleteFn = useServerFn(deleteStaff);

  const load = async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const byUser = new Map<string, AppRole[]>();
    ((roles ?? []) as { user_id: string; role: AppRole }[]).forEach(r => {
      const arr = byUser.get(r.user_id) ?? []; arr.push(r.role); byUser.set(r.user_id, arr);
    });
    setStaff(((profiles ?? []) as Profile[]).map(p => ({ ...p, roles: byUser.get(p.id) ?? [] })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setRole = async (userId: string, role: AppRole) => {
    if (!isSuperAdmin) { toast.error("Only super admin can change roles"); return; }
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error(error.message); else { toast.success("Role updated"); load(); }
  };

  const revoke = async (userId: string) => {
    if (!isSuperAdmin) return;
    await supabase.from("user_roles").delete().eq("user_id", userId);
    toast.success("Access revoked"); load();
  };

  const deleteStaffMember = async (s: StaffRow) => {
    if (!isSuperAdmin) return;
    if (!confirm(`Permanently delete ${s.full_name || s.email}? This removes their account, role, and profile and cannot be undone.`)) return;
    try {
      await deleteFn({ data: { userId: s.id } });
      toast.success(`${s.full_name || s.email} deleted`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    setInviting(true);
    try {
      await invite({ data: { email: inviteEmail, full_name: inviteName, role: inviteRole } });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail(""); setInviteName(""); setInviteRole("officer");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite");
    } finally {
      setInviting(false);
    }
  };

  const startEditPayroll = (s: StaffRow) => {
    setEditingPayroll(s.id);
    setPayrollDraft({
      phone: s.phone ?? "",
      position: s.position ?? "",
      department: s.department ?? "",
      start_date: s.start_date ?? "",
    });
  };

  const savePayroll = async (userId: string) => {
    const { error } = await supabase.from("profiles").update({
      phone:      payrollDraft.phone      || null,
      position:   payrollDraft.position   || null,
      department: payrollDraft.department || null,
      start_date: payrollDraft.start_date || null,
    }).eq("id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
    setEditingPayroll(null);
    load();
    if (userId === profile?.id) refresh();
  };

  return (
    <PageShell className="max-w-4xl">
      <PageHeader eyebrow="Configuration" title="Settings" />

      {/* Your profile */}
      <div className="mt-8 rounded-sm border border-border bg-card p-6 shadow-card">
        <div className="font-serif text-xl text-foreground">Your profile</div>
        <div className="mt-3 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Name</div><div>{profile?.full_name || "—"}</div></div>
          <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</div><div>{profile?.email}</div></div>
        </div>
      </div>

      {/* Staff & access */}
      <div className="mt-6 rounded-sm border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-serif text-xl text-foreground">Staff &amp; access</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isSuperAdmin ? "Grant or revoke staff access and set roles." : "Only super admins can change roles."}
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <form onSubmit={handleInvite} className="mt-4 rounded-sm border border-accent/30 bg-accent/5 p-4">
            <div className="text-[10px] uppercase tracking-[0.22em] text-accent">Invite new staff</div>
            <p className="mt-1 text-xs text-muted-foreground">The recipient will receive an email with a link to set their password.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <input required type="text" placeholder="Full name" value={inviteName} onChange={e => setInviteName(e.target.value)}
                className="rounded-sm border border-input bg-background px-3 py-2 text-sm sm:col-span-1" />
              <input required type="email" placeholder="email@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                className="rounded-sm border border-input bg-background px-3 py-2 text-sm sm:col-span-2" />
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value as AppRole)}
                className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
                <option value="officer">Officer</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super admin</option>
              </select>
            </div>
            <button type="submit" disabled={inviting}
              className="mt-3 rounded-sm bg-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {inviting ? "Sending…" : "Send invitation"}
            </button>
          </form>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2 text-left">Name</th><th className="py-2 text-left">Email</th><th className="py-2 text-left">Role</th><th className="py-2 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Loading…</td></tr>}
              {staff.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="py-3">{s.full_name || "—"}</td>
                  <td className="py-3 text-muted-foreground">{s.email}</td>
                  <td className="py-3">
                    <select disabled={!isSuperAdmin} value={s.roles[0] ?? ""} onChange={(e) => e.target.value ? setRole(s.id, e.target.value as AppRole) : revoke(s.id)}
                      className="rounded-sm border border-input bg-background px-2 py-1 text-xs">
                      <option value="">No access</option>
                      <option value="officer">Officer</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super admin</option>
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {isSuperAdmin && s.roles.length > 0 && (
                        <button onClick={() => revoke(s.id)} className="text-xs text-warning hover:underline">Revoke access</button>
                      )}
                      {isSuperAdmin && (
                        <button onClick={() => deleteStaffMember(s)} className="text-xs text-destructive hover:underline">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff payroll profiles */}
      <div className="mt-6 rounded-sm border border-border bg-card p-6 shadow-card">
        <div className="font-serif text-xl text-foreground">Staff payroll profiles</div>
        <p className="mt-1 text-xs text-muted-foreground">Position, department, start date, and contact for each staff member. Used for payroll reference.</p>

        <div className="mt-5 space-y-3">
          {loading && <div className="text-xs text-muted-foreground">Loading…</div>}
          {staff.map(s => (
            <div key={s.id} className="rounded-sm border border-border bg-secondary/30 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-sm text-foreground">{s.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{s.email} · {s.roles[0] ? s.roles[0].replace("_", " ") : "no role"}</div>
                </div>
                {isSuperAdmin && editingPayroll !== s.id && (
                  <button onClick={() => startEditPayroll(s)} className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
              </div>

              {editingPayroll === s.id ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Phone</span>
                    <input value={payrollDraft.phone} onChange={e => setPayrollDraft(d => ({ ...d, phone: e.target.value }))}
                      className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" placeholder="+252 61 000 0000" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Position / Title</span>
                    <input value={payrollDraft.position} onChange={e => setPayrollDraft(d => ({ ...d, position: e.target.value }))}
                      className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. Visa Officer" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Department</span>
                    <input value={payrollDraft.department} onChange={e => setPayrollDraft(d => ({ ...d, department: e.target.value }))}
                      className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. Operations" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Start date</span>
                    <input type="date" value={payrollDraft.start_date} onChange={e => setPayrollDraft(d => ({ ...d, start_date: e.target.value }))}
                      className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" />
                  </label>
                  <div className="sm:col-span-2 flex gap-2">
                    <button onClick={() => savePayroll(s.id)}
                      className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs uppercase tracking-wider text-primary-foreground hover:bg-primary/90">
                      <Check className="h-3.5 w-3.5" /> Save
                    </button>
                    <button onClick={() => setEditingPayroll(null)}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-4">
                  <Pair label="Phone"      value={s.phone      || "—"} />
                  <Pair label="Position"   value={s.position   || "—"} />
                  <Pair label="Department" value={s.department || "—"} />
                  <Pair label="Start date" value={s.start_date ? new Date(s.start_date).toLocaleDateString() : "—"} />
                </div>
              )}
            </div>
          ))}
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

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-foreground">{value}</div>
    </div>
  );
}
