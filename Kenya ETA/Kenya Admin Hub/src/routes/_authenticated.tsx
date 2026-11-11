import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TopNav } from "@/components/admin/TopNav";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { loading, session, profile, isStaff } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !session) nav({ to: "/login" });
  }, [loading, session, nav]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Block unverified accounts — email must be confirmed before accessing admin (#23)
  if (!session.user.email_confirmed_at) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-sm border border-warning/50 bg-warning/10 p-8 text-center shadow-card">
          <h1 className="font-serif text-2xl text-foreground">Email not verified</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please verify your email address before accessing the admin panel. Check your inbox for a confirmation link.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">({session.user.email})</p>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-sm border border-border bg-card p-8 text-center shadow-card">
          <h1 className="font-serif text-2xl text-foreground">Awaiting access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account ({profile?.email}) is not yet assigned a staff role. Contact a super admin to grant access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="flex-1 pt-14">
        <Outlet />
      </main>
    </div>
  );
}
