import { Link } from "@tanstack/react-router";
import { ShieldOff } from "lucide-react";

export function AccessDenied({ requiredRole = "admin" }: { requiredRole?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-sm rounded-sm border border-border bg-card p-10 text-center shadow-card">
        <ShieldOff className="mx-auto h-8 w-8 text-muted-foreground" />
        <h2 className="mt-4 font-serif text-2xl text-foreground">Access restricted</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This section requires <span className="font-medium text-foreground capitalize">{requiredRole}</span> access or above. Contact a super admin to request elevated permissions.
        </p>
        <Link to="/" className="mt-6 inline-block rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:border-accent hover:text-foreground">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
