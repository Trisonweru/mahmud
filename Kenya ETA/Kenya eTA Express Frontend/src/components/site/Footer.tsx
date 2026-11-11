import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Headphones } from "lucide-react";
import { navLinks } from "./Header";
import { CONTACT } from "@/lib/site-contact";

const FOOTER_GOLD = "#c9a227";

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: FOOTER_GOLD }}>
      {children}
    </p>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 bg-[#0b1220] text-slate-300">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-sm font-bold text-white">
              Kenya Electronic Travel Authorization
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Application service for the Kenya eTA (formerly the Kenya eVisa) — Tourism, Family
              Visit and Transit.
            </p>
          </div>

          <div>
            <FooterHeading>Contact</FooterHeading>
            <div className="mt-4 space-y-3 text-sm">
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2.5 text-slate-300 hover:text-white"
              >
                <Mail
                  className="size-4 shrink-0"
                  style={{ color: FOOTER_GOLD }}
                  aria-hidden="true"
                />
                {CONTACT.email}
              </a>
              <address className="flex gap-2.5 not-italic">
                <MapPin
                  className="size-4 shrink-0 translate-y-0.5"
                  style={{ color: FOOTER_GOLD }}
                  aria-hidden="true"
                />
                <span>
                  {CONTACT.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </address>
            </div>

            <div className="mt-6">
              <FooterHeading>Customer support</FooterHeading>
              <p className="mt-3 flex gap-2.5 text-sm text-slate-400">
                <Headphones
                  className="size-4 shrink-0 translate-y-0.5"
                  style={{ color: FOOTER_GOLD }}
                  aria-hidden="true"
                />
                We are committed to excellent customer service. All support requests and inquiries
                will be attended to within 2 working days.
              </p>
            </div>
          </div>

          <div>
            <FooterHeading>Explore</FooterHeading>
            <nav aria-label="Footer" className="mt-4 flex flex-col gap-2.5 text-sm">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className="text-slate-300 hover:text-white">
                  {l.label}
                </Link>
              ))}
            </nav>
            <p className="mt-6 text-xs text-slate-500">
              Official government portal:{" "}
              <a
                href="https://www.etakenya.go.ke"
                className="underline decoration-dotted hover:text-white"
                rel="noopener noreferrer"
                target="_blank"
              >
                etakenya.go.ke
              </a>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-6 text-xs text-slate-500">
          <Link to="/terms" className="hover:text-white">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link to="/refund" className="hover:text-white">
            Refund Policy
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Disclaimer: Independent third-party service. Not a government agency.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          © {new Date().getFullYear()} Kenyaevisa.net is a trading name of Passkey Technologies
          Limited. Company No. 16877709 · Registered in England &amp; Wales.
        </p>
      </div>
    </footer>
  );
}
