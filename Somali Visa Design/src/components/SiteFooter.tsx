import { Link } from "react-router-dom";
import { Globe2, Mail, Shield, MapPin, Headphones, Phone } from "lucide-react";

export const SiteFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="container py-16 grid gap-12 md:grid-cols-6">
        <div className="md:col-span-2 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-accent/30">
              <Globe2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="font-serif text-xl">Somalia eVisa Application</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60">Application Service</div>
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-primary-foreground/70">
            An independent service helping travellers prepare and submit their
            eVisa applications with clarity and care.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-primary-foreground/60">
            <Shield className="h-3.5 w-3.5 text-accent" />
            Independent third-party service — not a government agency
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-accent mb-4">Services</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li><Link to="/" className="hover:text-accent transition-smooth">Apply for eVisa</Link></li>
            <li><Link to="/status" className="hover:text-accent transition-smooth">Application Status</Link></li>
            <li><Link to="/documents" className="hover:text-accent transition-smooth">Required Documents</Link></li>
            <li><Link to="/faqs" className="hover:text-accent transition-smooth">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-accent mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> support@evisasomali.com</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> +252 61 3886027</li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-accent mt-0.5 shrink-0" /> <span>71–75 Shelton Street<br />Covent Garden<br />London WC2H 9JQ, United Kingdom</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-accent mb-4">Customer Support</h4>
          <div className="flex items-start gap-2 text-sm text-primary-foreground/80">
            <Headphones className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <p className="leading-relaxed">We are committed to excellent customer service. All support requests and inquiries will be attended to within 2 working days.</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-accent mb-4">Legal</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li><Link to="/terms" className="hover:text-accent transition-smooth">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-accent transition-smooth">Privacy Policy</Link></li>
            <li><Link to="/refund" className="hover:text-accent transition-smooth">Refund Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container py-4 text-[11px] text-center text-primary-foreground/70">
          <span className="text-accent font-medium">Disclaimer:</span>{" "}
          Independent third-party service. Not a government agency.
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
          <div>© {new Date().getFullYear()} eVisa Somalia. Company No. 16877709 · Registered in England &amp; Wales.</div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-accent">Privacy</Link>
            <Link to="/terms" className="hover:text-accent">Terms</Link>
            <Link to="/refund" className="hover:text-accent">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
