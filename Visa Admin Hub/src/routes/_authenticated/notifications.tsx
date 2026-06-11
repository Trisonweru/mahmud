import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { notificationLabels, type Notification } from "@/lib/applications";
import { PageShell, PageHeader } from "@/components/admin/PageShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Admin" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("recipient_id", user.id).order("created_at", { ascending: false }).limit(200);
    setItems((data ?? []) as Notification[]);
    setLoading(false);
  };
  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase.channel(`notif-page-${user.id}`).on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${user.id}` }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [user?.id]);

  const markAll = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("recipient_id", user.id).is("read_at", null);
    load();
  };

  const deleteOne = async (id: string) => {
    // Optimistically remove from UI, restore on failure
    setItems(prev => prev.filter(n => n.id !== id));
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete notification. Please try again.");
      load(); // restore the item
    }
  };

  const deleteAll = async () => {
    if (!user || !confirm("Delete all notifications? This cannot be undone.")) return;
    const snapshot = items; // keep for rollback
    setItems([]);
    const { error } = await supabase.from("notifications").delete().eq("recipient_id", user.id);
    if (error) {
      toast.error("Failed to delete notifications. Please try again.");
      setItems(snapshot); // restore
    }
  };

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        eyebrow="Activity"
        title="Notifications"
        action={
          <div className="flex gap-2">
            <button onClick={markAll} className="rounded-sm border border-border bg-card px-4 py-2 text-xs uppercase tracking-wider hover:bg-secondary">Mark all read</button>
            {items.length > 0 && (
              <button onClick={deleteAll} className="inline-flex items-center gap-1.5 rounded-sm border border-destructive/40 bg-destructive/5 px-4 py-2 text-xs uppercase tracking-wider text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" /> Delete all
              </button>
            )}
          </div>
        }
      />

      <div className="mt-6 rounded-sm border border-border bg-card shadow-card">
        {loading && <div className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</div>}
        {!loading && items.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <div className="mt-3 text-sm text-muted-foreground">No notifications yet. New applications and payments will appear here in real time.</div>
          </div>
        )}
        {items.map(n => (
          <div key={n.id} className={`group flex items-start gap-3 border-b border-border px-4 py-4 last:border-0 ${!n.read_at ? "bg-accent-soft/30" : ""}`}>
            <Link to={n.application_id ? "/applications/$id" : "/notifications"} params={n.application_id ? { id: n.application_id } : undefined}
              className="min-w-0 flex-1 hover:opacity-80">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-accent">
                <span>{notificationLabels[n.type]}</span>
                <span className="text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <div className="mt-1 font-medium text-foreground">{n.title}</div>
              {n.body && <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>}
            </Link>
            <button
              onClick={() => deleteOne(n.id)}
              className="mt-1 shrink-0 rounded-sm p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              title="Delete notification"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
