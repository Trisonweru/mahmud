import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Users, CreditCard, BarChart3, Settings,
  ShieldCheck, Bell, LogOut, AlertTriangle, User, Menu, X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/admin/NotificationBell";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const allItems = [
  { title: "Dashboard",     url: "/",              icon: LayoutDashboard, minRole: "officer"     },
  { title: "Applications",  url: "/applications",  icon: FileText,        minRole: "officer"     },
  { title: "Queue",         url: "/queue",         icon: AlertTriangle,   minRole: "officer"     },
  { title: "Notifications", url: "/notifications", icon: Bell,            minRole: "officer"     },
  { title: "Customers",     url: "/customers",     icon: Users,           minRole: "admin"       },
  { title: "Payments",      url: "/payments",      icon: CreditCard,      minRole: "admin"       },
  { title: "Analytics",     url: "/analytics",     icon: BarChart3,       minRole: "admin"       },
  { title: "Settings",      url: "/settings",      icon: Settings,        minRole: "super_admin" },
] as const;

type MinRole = "officer" | "admin" | "super_admin";
function canSee(minRole: MinRole, isAdmin: boolean, isSuperAdmin: boolean) {
  if (minRole === "officer") return true;
  if (minRole === "admin") return isAdmin;
  return isSuperAdmin;
}

const roleBadge: Record<string, string> = {
  "Super admin": "bg-accent/15 text-accent",
  "Admin": "bg-info/10 text-info",
  "Officer": "bg-teal/10 text-teal",
  "Pending": "bg-muted text-muted-foreground",
};

export function TopNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { profile, roles, isAdmin, isSuperAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = allItems.filter(i => canSee(i.minRole, isAdmin, isSuperAdmin));
  const isActive = (url: string) => url === "/" ? path === "/" : path.startsWith(url);

  const initials = (profile?.full_name || profile?.email || "?")
    .split(" ").slice(0, 2).map(s => s[0]).join("").toUpperCase();
  const role = roles.includes("super_admin") ? "Super admin"
    : roles.includes("admin") ? "Admin"
    : roles.length ? "Officer" : "Pending";

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-border bg-white/95 shadow-sm backdrop-blur">
      {/* Gradient accent line at top */}
      <div className="h-0.5 w-full bg-gradient-gold" />

      {/* Main bar */}
      <div className="flex h-13 items-center gap-3 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-navy shadow-card">
            <ShieldCheck className="h-4 w-4 text-accent" />
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="font-serif text-sm font-semibold text-foreground">Somalia eVisa</div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Admin Console</div>
          </div>
        </Link>

        <div className="mx-2 h-5 w-px bg-border" />

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center gap-0.5 overflow-x-auto lg:flex">
          {items.map((item) => {
            const active = isActive(item.url);
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`group relative flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all ${
                  active
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className={`h-3.5 w-3.5 transition-colors ${active ? "text-accent" : "group-hover:text-foreground"}`} />
                {item.title}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-gold" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-2">
          <NotificationBell />

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-navy text-xs font-bold text-primary-foreground ring-2 ring-border hover:ring-accent/40 focus:outline-none transition-all">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Signed in as</div>
                <div className="mt-0.5 truncate text-xs font-medium text-foreground">{profile?.email}</div>
                <span className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleBadge[role] ?? roleBadge["Pending"]}`}>
                  {role}
                </span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex cursor-pointer items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="flex cursor-pointer items-center gap-2 text-sm text-destructive focus:text-destructive">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-card lg:hidden">
          <div className="flex overflow-x-auto px-4 py-2 gap-1">
            {items.map((item) => {
              const active = isActive(item.url);
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  onClick={() => setMobileOpen(false)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    active
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-3.5 w-3.5 ${active ? "text-accent" : ""}`} />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
