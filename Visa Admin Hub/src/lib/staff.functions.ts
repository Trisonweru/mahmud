import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const deleteStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
    const isSuper = (roles ?? []).some((r) => r.role === "super_admin");
    if (!isSuper) throw new Error("Only super admin can delete staff");
    if (data.userId === userId) throw new Error("Cannot delete your own account");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    await supabaseAdmin.from("profiles").delete().eq("id", data.userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const InviteSchema = z.object({
  email: z.string().email().max(255),
  full_name: z.string().min(1).max(120),
  role: z.enum(["officer", "admin", "super_admin"]),
});

export const inviteStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InviteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    // Only super admin can invite
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isSuper = (roles ?? []).some((r) => r.role === "super_admin");
    if (!isSuper) throw new Error("Only super admin can invite staff");

    const redirectTo = `${process.env.ADMIN_URL ?? "https://tanstack-start-app.evisasomali.workers.dev"}/login`;
    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      { data: { full_name: data.full_name }, redirectTo }
    );
    if (error || !invited.user) throw new Error(error?.message ?? "Failed to invite");

    // Override default 'officer' role from handle_new_user trigger if needed
    await supabaseAdmin.from("user_roles").delete().eq("user_id", invited.user.id);
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: invited.user.id, role: data.role });
    if (roleErr) throw new Error(roleErr.message);

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: invited.user.id, email: data.email, full_name: data.full_name });

    return { ok: true, email: data.email };
  });