import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { notificationLabels, type Notification } from "@/lib/applications";
import { toast } from "sonner";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15);
    setItems((data ?? []) as Notification[]);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const ch = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as Notification;
          setItems((prev) => [n, ...prev].slice(0, 15));
          toast.info(n.title, { description: n.body ?? undefined });
          // browser notification (if granted)
          if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "granted") {
            new window.Notification(n.title, { body: n.body ?? "" });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "default") {
      window.Notification.requestPermission().catch(() => {});
    }
  }, []);

  const unread = items.filter((i) => !i.read_at).length;

  const markAllRead = async () => {
    if (!user || unread === 0) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("recipient_id", user.id).is("read_at", null);
    load();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative rounded-sm border border-border p-2 text-muted-foreground hover:text-primary">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-1rem)] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-medium">Notifications</div>
          <button onClick={markAllRead} className="text-[11px] uppercase tracking-wider text-accent hover:text-primary">
            Mark all read
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet</div>
          )}
          {items.map((n) => (
            <Link
              key={n.id}
              to={n.application_id ? "/applications/$id" : "/notifications"}
              params={n.application_id ? { id: n.application_id } : undefined}
              onClick={() => setOpen(false)}
              className={`block border-b border-border px-4 py-3 hover:bg-secondary ${!n.read_at ? "bg-accent-soft/40" : ""}`}
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-accent">
                <span>{notificationLabels[n.type]}</span>
                <span className="text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">{n.title}</div>
              {n.body && <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</div>}
            </Link>
          ))}
        </div>
        <div className="border-t border-border px-4 py-2 text-center">
          <Link to="/notifications" onClick={() => setOpen(false)} className="text-xs uppercase tracking-wider text-accent hover:text-primary">
            View all
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
