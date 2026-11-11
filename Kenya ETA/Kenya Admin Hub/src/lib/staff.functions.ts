import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database, Json } from "@/integrations/supabase/types";

const DEFAULT_ADMIN_URL = "https://kenya-eta-admin.evisasomali.workers.dev";
const loginUrl = () => `${process.env.ADMIN_URL ?? DEFAULT_ADMIN_URL}/login`;

const RoleSchema = z.enum(["officer", "admin", "super_admin"]);
const EmailSchema = z.string().trim().toLowerCase().email().max(255);
const NewPasswordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");
const BAN_FOREVER = "876000h";

// ── helpers ────────────────────────────────────────────────────────────────

async function rolesOf(userId: string) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}

async function profileOf(userId: string) {
  const { data } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

async function requireSuperAdmin(userId: string) {
  const [roles, profile] = await Promise.all([rolesOf(userId), profileOf(userId)]);
  if (!roles.includes("super_admin") || (profile && profile.status !== "active")) {
    throw new Error("Only an active super administrator can manage accounts");
  }
  return profile;
}

/** Number of active super admins, optionally ignoring one user. */
async function activeSuperAdminCount(excludeId?: string) {
  const { data: rows } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "super_admin");
  const ids = (rows ?? []).map((r) => r.user_id).filter((id) => id !== excludeId);
  if (ids.length === 0) return 0;
  const { data: profiles } = await supabaseAdmin.from("profiles").select("id, status").in("id", ids);
  return (profiles ?? []).filter((p) => p.status === "active").length;
}

async function audit(entry: {
  actorId: string | null;
  actorEmail: string | null;
  targetId?: string | null;
  targetEmail?: string | null;
  action: string;
  details?: Record<string, unknown>;
}) {
  let ip: string | null = null;
  let userAgent: string | null = null;
  try {
    const req = getRequest();
    ip = req?.headers.get("cf-connecting-ip") ?? req?.headers.get("x-forwarded-for") ?? null;
    userAgent = req?.headers.get("user-agent")?.slice(0, 300) ?? null;
  } catch {
    /* no request context */
  }
  const { error } = await supabaseAdmin.from("account_audit_log").insert({
    actor_id: entry.actorId,
    actor_email: entry.actorEmail,
    target_id: entry.targetId ?? null,
    target_email: entry.targetEmail ?? null,
    action: entry.action,
    details: (entry.details ?? {}) as Json,
    ip,
    user_agent: userAgent,
  });
  if (error) console.error("[audit] failed to write account audit log", error.message);
}

/** Re-authenticates with the current password using a throwaway client (no session kept). */
async function verifyPassword(email: string, password: string) {
  const c = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) return false;
  await c.auth.signOut().catch(() => undefined);
  return true;
}

async function authEmail(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error || !data.user) throw new Error("Account not found");
  return data.user.email ?? "";
}

// ── invite ─────────────────────────────────────────────────────────────────

const InviteSchema = z.object({
  email: EmailSchema,
  full_name: z.string().trim().min(1).max(120),
  role: RoleSchema,
});

export const inviteStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InviteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const actor = await requireSuperAdmin(context.userId);

    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { full_name: data.full_name },
      redirectTo: loginUrl(),
    });
    if (error || !invited.user) throw new Error(error?.message ?? "Failed to invite");

    // Override default 'officer' role from handle_new_user trigger if needed
    await supabaseAdmin.from("user_roles").delete().eq("user_id", invited.user.id);
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: invited.user.id, role: data.role });
    if (roleErr) throw new Error(roleErr.message);

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: invited.user.id, email: data.email, full_name: data.full_name, status: "active" });

    await audit({
      actorId: context.userId,
      actorEmail: actor?.email ?? null,
      targetId: invited.user.id,
      targetEmail: data.email,
      action: "account_invited",
      details: { role: data.role, full_name: data.full_name },
    });
    return { ok: true, email: data.email };
  });

// ── own credentials (2.1) ──────────────────────────────────────────────────

export const changeOwnPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ currentPassword: z.string().min(1).max(72), newPassword: NewPasswordSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const email = await authEmail(context.userId);
    if (!(await verifyPassword(email, data.currentPassword))) {
      await audit({ actorId: context.userId, actorEmail: email, targetId: context.userId, targetEmail: email, action: "password_change_failed", details: { reason: "wrong current password" } });
      throw new Error("Current password is incorrect");
    }
    if (data.currentPassword === data.newPassword) throw new Error("New password must be different");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, { password: data.newPassword });
    if (error) throw new Error(error.message);
    await audit({ actorId: context.userId, actorEmail: email, targetId: context.userId, targetEmail: email, action: "own_password_changed" });
    return { ok: true };
  });

export const changeOwnEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ currentPassword: z.string().min(1).max(72), newEmail: EmailSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const oldEmail = await authEmail(context.userId);
    if (data.newEmail === oldEmail.toLowerCase()) throw new Error("That is already your email address");
    if (!(await verifyPassword(oldEmail, data.currentPassword))) {
      await audit({ actorId: context.userId, actorEmail: oldEmail, targetId: context.userId, targetEmail: oldEmail, action: "email_change_failed", details: { reason: "wrong current password" } });
      throw new Error("Current password is incorrect");
    }
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, { email: data.newEmail, email_confirm: true });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("profiles").update({ email: data.newEmail }).eq("id", context.userId);
    await audit({ actorId: context.userId, actorEmail: oldEmail, targetId: context.userId, targetEmail: data.newEmail, action: "own_email_changed", details: { from: oldEmail, to: data.newEmail } });
    return { ok: true, email: data.newEmail };
  });

// ── password reset (login page) ────────────────────────────────────────────

/** Public: always answers ok so it cannot be used to discover which emails have accounts. */
export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ email: EmailSchema }).parse(input))
  .handler(async ({ data }) => {
    const { data: profile } = await supabaseAdmin.from("profiles").select("id, email, status").ilike("email", data.email.replace(/[\\%_]/g, "\\$&")).maybeSingle();
    if (profile?.email && profile.status === "active" && (await rolesOf(profile.id)).length > 0) {
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(profile.email, { redirectTo: loginUrl() });
      await audit({
        actorId: null,
        actorEmail: data.email,
        targetId: profile.id,
        targetEmail: profile.email,
        action: "password_reset_requested",
        details: error ? { error: error.message } : {},
      });
    }
    return { ok: true };
  });

/** Called after a user sets a password from an invite or reset link. */
export const recordPasswordSet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ kind: z.enum(["invite", "recovery"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const email = await authEmail(context.userId);
    await audit({
      actorId: context.userId,
      actorEmail: email,
      targetId: context.userId,
      targetEmail: email,
      action: data.kind === "invite" ? "invite_accepted" : "password_reset_completed",
    });
    return { ok: true };
  });

// ── manage other accounts (2.2) ────────────────────────────────────────────

const UpdateSchema = z.object({
  userId: z.string().uuid(),
  full_name: z.string().trim().min(1).max(120).optional(),
  email: EmailSchema.optional(),
  role: RoleSchema.optional(),
  status: z.enum(["active", "suspended"]).optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  position: z.string().trim().max(120).nullable().optional(),
  department: z.string().trim().max(120).nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export const updateStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => UpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const actor = await requireSuperAdmin(context.userId);
    const target = await profileOf(data.userId);
    if (!target) throw new Error("Account not found");
    if (target.status === "deleted") throw new Error("This account is deleted. Restore it first.");
    const isSelf = data.userId === context.userId;
    const currentRoles = await rolesOf(data.userId);
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    // Safeguards
    if (isSelf && data.role && data.role !== "super_admin") throw new Error("You cannot remove your own super admin role");
    if (isSelf && data.status === "suspended") throw new Error("You cannot suspend your own account");
    if (isSelf && data.email && data.email !== (target.email ?? "").toLowerCase())
      throw new Error("Change your own email from “Your login” (requires your current password)");
    const losesSuper =
      currentRoles.includes("super_admin") &&
      ((data.role && data.role !== "super_admin") || data.status === "suspended");
    if (losesSuper && (await activeSuperAdminCount(data.userId)) === 0)
      throw new Error("At least one active super admin must remain");

    // Login email
    if (data.email && data.email !== (target.email ?? "").toLowerCase()) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { email: data.email, email_confirm: true });
      if (error) throw new Error(error.message);
      changes.email = { from: target.email, to: data.email };
    }

    // Status (suspension blocks sign-in at the auth layer)
    if (data.status && data.status !== target.status) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
        ban_duration: data.status === "suspended" ? BAN_FOREVER : "none",
      });
      if (error) throw new Error(error.message);
      changes.status = { from: target.status, to: data.status };
    }

    // Role
    if (data.role && !(currentRoles.length === 1 && currentRoles[0] === data.role)) {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
      const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
      if (error) throw new Error(error.message);
      changes.role = { from: currentRoles.join(",") || null, to: data.role };
    }

    // Profile details
    const patch: Database["public"]["Tables"]["profiles"]["Update"] = {};
    for (const k of ["full_name", "phone", "position", "department", "start_date"] as const) {
      const v = data[k];
      if (v === undefined) continue;
      const next = v === "" ? null : v;
      if ((target[k] ?? null) !== next) {
        (patch as Record<string, string | null>)[k] = next;
        changes[k] = { from: target[k] ?? null, to: next };
      }
    }
    if (changes.email) patch.email = data.email!;
    if (changes.status) patch.status = data.status!;
    if (Object.keys(patch).length > 0) {
      const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.userId);
      if (error) throw new Error(error.message);
    }

    if (Object.keys(changes).length > 0) {
      const action = changes.status
        ? data.status === "suspended" ? "account_suspended" : "account_reactivated"
        : changes.email ? "account_email_changed"
        : changes.role ? "account_role_changed"
        : "account_details_updated";
      await audit({
        actorId: context.userId,
        actorEmail: actor?.email ?? null,
        targetId: data.userId,
        targetEmail: data.email ?? target.email,
        action,
        details: { changes },
      });
    }
    return { ok: true, changed: Object.keys(changes) };
  });

export const resetStaffPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .discriminatedUnion("method", [
        z.object({ userId: z.string().uuid(), method: z.literal("email") }),
        z.object({ userId: z.string().uuid(), method: z.literal("set"), password: NewPasswordSchema }),
      ])
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const actor = await requireSuperAdmin(context.userId);
    const target = await profileOf(data.userId);
    if (!target || target.status === "deleted") throw new Error("Account not found");
    if (data.userId === context.userId && data.method === "set")
      throw new Error("Use “Change password” for your own account (requires your current password)");

    if (data.method === "email") {
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(target.email ?? "", { redirectTo: loginUrl() });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.password });
      if (error) throw new Error(error.message);
    }
    await audit({
      actorId: context.userId,
      actorEmail: actor?.email ?? null,
      targetId: data.userId,
      targetEmail: target.email,
      action: data.method === "email" ? "password_reset_link_sent" : "password_set_by_admin",
    });
    return { ok: true };
  });

/** Soft delete: login blocked, access removed, profile + audit history retained. */
export const deleteStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ userId: z.string().uuid(), confirmEmail: EmailSchema, reason: z.string().trim().min(3, "Give a reason").max(500) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const actor = await requireSuperAdmin(context.userId);
    if (data.userId === context.userId) throw new Error("You cannot delete your own account");
    const target = await profileOf(data.userId);
    if (!target) throw new Error("Account not found");
    if (target.status === "deleted") throw new Error("Account is already deleted");
    if (data.confirmEmail !== (target.email ?? "").toLowerCase()) throw new Error("Confirmation email does not match this account");
    const roles = await rolesOf(data.userId);
    if (roles.includes("super_admin") && (await activeSuperAdminCount(data.userId)) === 0)
      throw new Error("At least one active super admin must remain");

    const { error: banErr } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { ban_duration: BAN_FOREVER });
    if (banErr) throw new Error(banErr.message);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status: "deleted", deleted_at: new Date().toISOString(), deleted_by: context.userId })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);

    await audit({
      actorId: context.userId,
      actorEmail: actor?.email ?? null,
      targetId: data.userId,
      targetEmail: target.email,
      action: "account_deleted",
      details: { reason: data.reason, previous_roles: roles, previous_status: target.status },
    });
    return { ok: true };
  });

export const restoreStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ userId: z.string().uuid(), role: RoleSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const actor = await requireSuperAdmin(context.userId);
    const target = await profileOf(data.userId);
    if (!target || target.status !== "deleted") throw new Error("Account is not deleted");

    const { error: banErr } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { ban_duration: "none" });
    if (banErr) throw new Error(banErr.message);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error: roleErr } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    if (roleErr) throw new Error(roleErr.message);
    await supabaseAdmin.from("profiles").update({ status: "active", deleted_at: null, deleted_by: null }).eq("id", data.userId);

    await audit({
      actorId: context.userId,
      actorEmail: actor?.email ?? null,
      targetId: data.userId,
      targetEmail: target.email,
      action: "account_restored",
      details: { role: data.role },
    });
    return { ok: true };
  });
