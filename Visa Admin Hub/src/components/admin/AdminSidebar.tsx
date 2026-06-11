import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FileText, Users, CreditCard, BarChart3, Settings, ShieldCheck, Bell, LogOut, AlertTriangle } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const allOperations = [
  { title: "Dashboard",         url: "/",              icon: LayoutDashboard, minRole: "officer"     },
  { title: "Applications",      url: "/applications",  icon: FileText,        minRole: "officer"     },
  { title: "Submission queue",  url: "/queue",         icon: AlertTriangle,   minRole: "officer"     },
  { title: "Notifications",     url: "/notifications", icon: Bell,            minRole: "officer"     },
  { title: "Customers",         url: "/customers",     icon: Users,           minRole: "admin"       },
  { title: "Payments",          url: "/payments",      icon: CreditCard,      minRole: "admin"       },
] as const;

const allInsights = [
  { title: "Analytics", url: "/analytics", icon: BarChart3, minRole: "admin"       },
  { title: "Settings",  url: "/settings",  icon: Settings,  minRole: "super_admin" },
] as const;

type MinRole = "officer" | "admin" | "super_admin";
function canSee(minRole: MinRole, isAdmin: boolean, isSuperAdmin: boolean) {
  if (minRole === "officer") return true;
  if (minRole === "admin") return isAdmin;
  return isSuperAdmin;
}

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { profile, roles, isAdmin, isSuperAdmin, signOut } = useAuth();
  const isActive = (url: string) => url === "/" ? path === "/" : path.startsWith(url);

  const operations = allOperations.filter(i => canSee(i.minRole, isAdmin, isSuperAdmin));
  const insights = allInsights.filter(i => canSee(i.minRole, isAdmin, isSuperAdmin));

  const role = roles.includes("super_admin") ? "Super admin"
    : roles.includes("admin") ? "Admin"
    : roles.length ? "Officer" : "Pending";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-gold shadow-gold">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-serif text-base font-semibold text-sidebar-foreground">Somalia eVisa</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/50">Admin Console</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-bold uppercase tracking-[0.25em] text-sidebar-foreground/40">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operations.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link
                        to={item.url}
                        className={`relative flex items-center gap-3 rounded-md transition-all ${
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-sidebar-primary" />
                        )}
                        <item.icon className={`h-4 w-4 ${active ? "text-sidebar-primary" : ""}`} />
                        {!collapsed && <span className={`text-sm ${active ? "font-semibold" : "font-normal"}`}>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-bold uppercase tracking-[0.25em] text-sidebar-foreground/40">
            Insights
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {insights.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link
                        to={item.url}
                        className={`relative flex items-center gap-3 rounded-md transition-all ${
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-sidebar-primary" />
                        )}
                        <item.icon className={`h-4 w-4 ${active ? "text-sidebar-primary" : ""}`} />
                        {!collapsed && <span className={`text-sm ${active ? "font-semibold" : "font-normal"}`}>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="space-y-2 px-3 py-3">
            <div className="text-[10px] text-sidebar-foreground/50">
              {profile?.full_name || profile?.email || "—"}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-sidebar-primary">
              {role}
            </div>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-md border border-sidebar-border/60 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60 transition-all hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={signOut}
            className="mx-auto my-2 flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
