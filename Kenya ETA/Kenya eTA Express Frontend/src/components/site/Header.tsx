import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const navLinks = [
  { to: "/how-it-works", label: "How It Works" },
  { to: "/kenya-visa", label: "Visa Types" },
  { to: "/kenya-evisa", label: "eVisa → eTA" },
  { to: "/kenya-eta", label: "Nationality" },
  { to: "/requirements", label: "Documents" },
  { to: "/pricing", label: "Pricing" },
  { to: "/track", label: "Track" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center overflow-hidden rounded-xl shadow-soft">
            <img
              src="/kenya-flag-logo.png"
              alt="Kenya flag"
              className="h-full w-full object-cover"
              width={36}
              height={36}
            />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-bold">Kenya eTA</span>
            <span className="block text-[11px] text-muted-foreground">Electronic Travel Authorization</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="whitespace-nowrap rounded-lg px-1.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden bg-cta shadow-soft sm:inline-flex">
            <Link to="/apply">Start Application</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-xs">
              <SheetTitle className="px-4 pt-4 font-display">Menu</SheetTitle>
              <nav className="mt-2 flex flex-col gap-1 px-2" aria-label="Mobile">
                {[{ to: "/", label: "Home" }, ...navLinks].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                    activeProps={{ className: "bg-secondary text-foreground" }}
                  >
                    {l.label}
                  </Link>
                ))}
                <Button asChild className="mt-3 bg-cta" onClick={() => setOpen(false)}>
                  <Link to="/apply">Start Application</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
