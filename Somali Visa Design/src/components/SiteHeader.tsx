import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/apply", label: "Apply" },
  { to: "/status", label: "Status" },
  { to: "/documents", label: "Documents" },
  { to: "/faqs", label: "FAQs" },
];

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-gradient-navy shadow-card">
            <Globe2 className="h-5 w-5 text-accent" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-xl font-semibold text-primary">Somalia eVisa Application</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Application Service</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && <span className="absolute inset-x-4 -bottom-0.5 h-0.5 bg-gradient-gold" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            to="/apply"
            className="inline-flex items-center gap-2 rounded-sm bg-gradient-navy px-6 py-3 text-sm font-medium text-primary-foreground shadow-card hover:shadow-elegant transition-smooth"
          >
            Apply Now
            <span className="h-1 w-1 rounded-full bg-accent" />
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          className="lg:hidden p-2 text-primary"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 text-sm font-medium rounded-sm",
                    isActive ? "bg-secondary text-primary" : "text-muted-foreground"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/apply"
              onClick={() => setOpen(false)}
              className="mt-2 text-center rounded-sm bg-gradient-navy px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
