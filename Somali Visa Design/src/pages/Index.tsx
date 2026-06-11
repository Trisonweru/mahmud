import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PageSEO } from "@/components/PageSEO";
import { SectionHeading } from "@/components/SectionHeading";
import { COUNTRIES } from "@/data/countries";
import heroImg from "@/assets/hero-somalia.jpg";
import passportImg from "@/assets/passport.jpg";
import { toast } from "sonner";
import { setPending } from "@/lib/pendingApplication";
import { FUNCTIONS_URL, fnHeaders } from "@/lib/api";
import { DateDropdown } from "@/components/DateDropdown";
import { monthsBetween } from "@/lib/validation";
import {
  ArrowRight, ShieldCheck, Clock4, FileCheck2, Headphones, Lock, Sparkles,
  CheckCircle2, FileText, BadgeCheck, Plane, UploadCloud, Zap, PenLine,
  Camera, Phone, Mail, X, Globe2, Users, User, Hash, CalendarDays,
} from "lucide-react";


const todayISO = () => new Date().toISOString().slice(0, 10);
const sixMonthsFromNowISO = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().slice(0, 10);
};

const Index = () => {
  const navigate = useNavigate();
  const [showQurba, setShowQurba] = useState(false);
  const countries = useMemo(() => COUNTRIES, []);

  // Qurba-Joog quick-form state
  const [passport, setPassport] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [ticket, setTicket] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportIssueDate, setPassportIssueDate] = useState("");
  const [passportExpiryDate, setPassportExpiryDate] = useState("");
  const [nationality, setNationality] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passport || !photo || !ticket) {
      toast.error("Please upload your passport, photo and ticket. / Fadlan soo geli baasaboorka, sawirka iyo tigidhka.");
      return;
    }
    if (!fullName || !passportNumber || !nationality || !whatsapp || !email || !passportIssueDate || !passportExpiryDate) {
      toast.error("Please provide your full name, passport number, issue & expiry dates, nationality, WhatsApp and email. / Fadlan buuxi magaca, lambarka baasaboor, taariikhda bixinta & dhicitaanka, dhalashada, WhatsApp iyo emailka.");
      return;
    }
    if (new Date(passportIssueDate) > new Date()) {
      toast.error("Passport issue date cannot be in the future. / Taariikhda bixinta baasaboor ma noqon karto mid mustaqbalka ah.");
      return;
    }
    if (monthsBetween(new Date(), new Date(passportExpiryDate)) < 6) {
      toast.error("Passport must be valid for more than 6 months from today. / Baasaboorku waa inuu shaqaynayaa in ka badan 6 bilood.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("flow", "express");
      fd.append("email", email.trim());
      fd.append("fullName", fullName);
      fd.append("phone", whatsapp.trim());
      fd.append("whatsapp", whatsapp.trim());
      fd.append("passportNumber", passportNumber);
      fd.append("passportIssueDate", passportIssueDate);
      fd.append("passportExpiryDate", passportExpiryDate);
      fd.append("nationality", nationality);
      fd.append("passport", passport);
      fd.append("photo", photo);
      fd.append("ticket", ticket);

      const res = await fetch(`${FUNCTIONS_URL}/application-save`, {
        method: "POST",
        headers: fnHeaders(),
        body: fd,
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok || !json.application_id) {
        toast.error(json.error || "Failed to save application. Please try again.");
        return;
      }

      setPending({
        flow: "express",
        application_id: json.application_id,
        email,
        fullName,
        passportNumber,
        passportIssueDate,
        passportExpiryDate,
        whatsapp,
        nationality,
      });
      toast.success("Documents received — redirecting to payment. / Dokumentigaaga waa la helay — waxaa lagu wareejinayaa lacag-bixinta.");
      navigate("/payment", { state: { type: "express", email, fullName, passportNumber } });
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const homepageJsonLd = [
    {
      "@type": "Organization",
      "@id": "https://www.evisasomali.com/#org",
      "name": "eVisa Somalia",
      "url": "https://www.evisasomali.com",
      "logo": { "@type": "ImageObject", "url": "https://www.evisasomali.com/og-image.jpg", "width": 1200, "height": 630 },
      "email": "support@evisasomali.com",
      "address": { "@type": "PostalAddress", "streetAddress": "71-75 Shelton Street, Covent Garden", "addressLocality": "London", "postalCode": "WC2H 9JQ", "addressCountry": "GB" },
      "contactPoint": { "@type": "ContactPoint", "email": "support@evisasomali.com", "contactType": "customer support", "availableLanguage": ["English", "Somali"] },
      "sameAs": []
    },
    {
      "@type": "WebSite",
      "@id": "https://www.evisasomali.com/#website",
      "name": "eVisa Somalia",
      "url": "https://www.evisasomali.com",
      "publisher": { "@id": "https://www.evisasomali.com/#org" }
    },
    {
      "@type": "Service",
      "name": "Somalia eVisa Application Service",
      "description": "Apply for your Somalia eVisa online. Upload your passport and photo — our specialists prepare and submit your application in 60 seconds.",
      "provider": { "@id": "https://www.evisasomali.com/#org" },
      "areaServed": { "@type": "Country", "name": "Somalia" },
      "serviceType": "Visa Application Assistance",
      "offers": { "@type": "Offer", "price": "94", "priceCurrency": "USD" }
    }
  ];

  return (
    <>
      <PageSEO
        title="Apply for Somalia eVisa Online | Fast & Secure | eVisa Somalia"
        description="Get your Somalia eVisa in 60 seconds. Upload your passport, photo and ticket — our specialists handle the rest. $94 USD. WhatsApp updates. 24/7 support."
        canonical="https://www.evisasomali.com/"
        jsonLd={homepageJsonLd}
      />
      {/* HERO — choice first */}
      <section className="relative">
        {/* Top header band with background image */}
        <div className="relative isolate overflow-hidden">
          <img
            src={heroImg}
            alt="Somalia eVisa online application — passport and airplane ready for travel"
            className="absolute inset-0 h-full w-full object-cover"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="sync"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="relative container py-14 md:py-20">
            <div className="text-center max-w-3xl mx-auto text-primary-foreground">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 bg-primary-foreground/10 px-4 py-1.5 text-xs tracking-[0.15em] text-primary-foreground backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Somalia eVisa Application · Apply Online
              </div>
              <h1 className="mt-6 font-serif text-4xl md:text-6xl font-semibold leading-[1.05]">
                Choose your <span className="text-primary-foreground italic">application</span> type
              </h1>
              <p className="mt-3 font-serif italic text-xl md:text-2xl text-primary-foreground/95">
                Dooro nooca codsigaaga
              </p>
              <p className="mt-5 text-base text-primary-foreground/95">
                Two clear paths — pick the one that matches you, then continue. ·
                <span className="italic"> Laba waddo oo cad — dooro tan kugu habboon.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Cards + form area on plain background */}
        <div className="container py-12 md:py-16">

          {/* Two choice cards — side by side (Qurba first, then Ajnabi) */}
          <div className={`grid md:grid-cols-2 gap-6 max-w-5xl mx-auto ${showQurba ? "hidden" : ""}`}>
            {/* Qurba-Joog (diaspora) — Express */}
            <button
              type="button"
              onClick={() => {
                setShowQurba((v) => !v);
                setTimeout(() => {
                  document.getElementById("qurba-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 60);
              }}
              className={`group relative text-left rounded-sm px-7 pt-10 pb-7 md:px-8 md:pt-12 md:pb-8 shadow-elegant transition-smooth border-2 bg-card ${
                showQurba ? "border-accent ring-2 ring-accent/40" : "border-accent/60 hover:border-accent"
              }`}
            >
              <div className="absolute -top-3 left-6 bg-gradient-gold text-accent-foreground text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-sm">
                Option 1 · Express
              </div>
              {showQurba && (
                <span
                  role="button"
                  aria-label="Close"
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowQurba(false); }}
                  className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-accent shadow-card transition-smooth"
                >
                  <X className="h-4 w-4" />
                </span>
              )}
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-navy text-accent">
                <Users className="h-5 w-5" />
              </div>
              <div className="mt-5 text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">
                Diaspora Service · Adeeg Qurba-Joog
              </div>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-primary leading-tight">
                I am a foreigner (Qurba-Joog)
              </h2>
              <p className="mt-1 font-serif italic text-base font-medium text-primary">
                Waxaan ahay Qurba-Joog
              </p>
              <p className="mt-3 text-sm text-foreground leading-relaxed">
                Diaspora travellers holding a foreign passport. Apply in under 60 seconds by uploading your passport, photo and ticket, then providing a few essential details.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-foreground">
                {[
                  "Fast 60-second application",
                  "Simple document upload",
                  "Minimal information required",
                  "Updates via WhatsApp & email",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                <div className="rounded-sm bg-accent-soft px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Applicable fee</div>
                  <div className="font-serif text-2xl font-semibold text-primary leading-none mt-0.5">
                    $94 <span className="text-xs font-sans text-primary/70">USD</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-sm bg-gradient-gold px-5 py-3 text-sm font-semibold text-accent-foreground shadow-gold group-hover:shadow-elegant transition-smooth">
                  Use Express <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>

            {/* Standard foreigner — direct link to /apply/start */}
            <Link
              to="/apply/start"
              className="group relative text-left bg-card rounded-sm px-7 pt-10 pb-7 md:px-8 md:pt-12 md:pb-8 shadow-elegant transition-smooth border-2 border-accent/60 hover:border-accent block"
            >
              <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-sm">
                Option 2
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-navy text-accent">
                <Globe2 className="h-5 w-5" />
              </div>
              <h2 className="mt-6 font-serif text-2xl font-semibold text-primary leading-tight">
                I am a Foreigner (Ajnabi)
              </h2>
              <p className="mt-1 font-serif italic text-base font-medium text-primary">
                Waxaan ahay Ajnabi
              </p>
              <p className="mt-3 text-sm text-foreground leading-relaxed">
                Travellers holding a foreign passport. A local sponsor is required, so you'll
                complete the official application yourself with our step-by-step guidance.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-foreground">
                {[
                  "Sponsor details required",
                  "Guided form",
                  "Same official eVisa",
                ].map((t) => (

                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                <div className="rounded-sm bg-secondary px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Applicable fee</div>
                  <div className="font-serif text-2xl font-semibold text-primary leading-none mt-0.5">
                    $94 <span className="text-xs font-sans text-primary/70">USD</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-sm bg-gradient-navy px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card group-hover:shadow-elegant transition-smooth">
                  Start Form <ArrowRight className="h-4 w-4 text-accent" />
                </span>
              </div>
            </Link>
          </div>

          {showQurba && (
            <form
              id="qurba-form"
              onSubmit={handleQuick}
              className="mt-10 max-w-2xl mx-auto bg-card border border-accent/40 rounded-sm p-6 md:p-8 shadow-elegant space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => setShowQurba(false)}
                    className="text-xs text-muted-foreground hover:text-primary mb-2 inline-flex items-center gap-1"
                  >
                    ← Back to options
                  </button>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-accent">Express · Qurba-Joog</div>
                  <h3 className="mt-1 font-serif text-2xl text-primary leading-tight">
                    Apply in 60 seconds
                    <span className="block text-sm font-sans italic text-muted-foreground mt-1">
                      Codso 60 ilbiriqsi gudahood
                    </span>
                  </h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-gradient-navy text-accent">
                  <Zap className="h-5 w-5" />
                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">
                <MiniUploader
                  icon={FileText}
                  label="Passport"
                  sublabel="Baasaboor"
                  file={passport}
                  onChange={setPassport}
                  onClear={() => setPassport(null)}
                  accept="image/*,application/pdf"
                />
                <MiniUploader
                  icon={Camera}
                  label="Photo"
                  sublabel="Sawir"
                  file={photo}
                  onChange={setPhoto}
                  onClear={() => setPhoto(null)}
                  accept="image/*"
                />
                <MiniUploader
                  icon={Plane}
                  label="Ticket"
                  sublabel="Tigidh"
                  file={ticket}
                  onChange={setTicket}
                  onClear={() => setTicket(null)}
                  accept="image/*,application/pdf"
                />
              </div>

              <MiniField
                icon={User}
                label="Full name"
                sublabel="Magaca oo dhan"
                type="text"
                placeholder="John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <MiniField
                icon={Hash}
                label="Passport number"
                sublabel="Lambarka baasaboor"
                type="text"
                placeholder="A12345678"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                required
              />

              <DateDropdown
                label="Issue date / Taariikhda bixinta"
                value={passportIssueDate}
                onChange={setPassportIssueDate}
                minYear={1960}
                maxYear={new Date().getFullYear()}
              />
              <DateDropdown
                label="Expiry date / Taariikhda dhicitaanka"
                value={passportExpiryDate}
                onChange={setPassportExpiryDate}
                minYear={new Date().getFullYear()}
                maxYear={new Date().getFullYear() + 15}
              />
              <p className="text-[11px] text-muted-foreground -mt-2">
                Passport must be valid for <strong>more than 6 months</strong> from today.
              </p>



              <MiniSelect
                icon={Globe2}
                label="Nationality"
                sublabel="Dhalasho"
                value={nationality}
                onChange={(v) => setNationality(v)}
                options={countries}
                required
              />


              <MiniField
                icon={Phone}
                label="WhatsApp number"
                sublabel="Lambarka WhatsApp"
                type="tel"
                placeholder="+252 61 234 5678"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
              <MiniField
                icon={Mail}
                label="Email address"
                sublabel="Cinwaanka email-ka"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label className="flex items-start gap-3 text-xs text-foreground/85 cursor-pointer">
                <input type="checkbox" required className="mt-1 accent-[hsl(var(--accent))]" />
                <span>
                  I request immediate performance of services and consent to the processing of my
                  passport photo (biometric data) for my eTAS application.
                  <span className="block mt-1 italic text-muted-foreground">
                    By checking this box, you confirm that you have read and agree to our{" "}
                    <Link to="/terms" className="text-accent underline">Terms of Service</Link>,{" "}
                    <Link to="/privacy" className="text-accent underline">Privacy Policy</Link>, and{" "}
                    <Link to="/refund" className="text-accent underline">Refund Policy</Link>.
                  </span>
                </span>
              </label>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="rounded-sm bg-accent-soft px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Applicable fee · Qiimaha</div>
                  <div className="font-serif text-2xl font-semibold text-primary leading-none mt-0.5">
                    $94 <span className="text-xs font-sans text-primary/70">USD</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-sm bg-gradient-gold px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-gold hover:shadow-elegant transition-smooth disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Uploading…" : "Continue"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <Lock className="h-3 w-3 text-accent mt-0.5" />
                Encrypted & only seen by our application team. · Waa la sireeyay, kaliya kooxdayada ayaa arki karta.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* TRANSPARENT PRICING */}
      <section className="container py-20">
        <SectionHeading
          eyebrow="Pricing"
          title="Transparent Pricing"
          description="No hidden fees. One simple, all-inclusive price for your Somalia eVisa application."
        />
        <div className="mt-12 max-w-2xl mx-auto bg-card border border-border rounded-sm p-10 md:p-12 text-center shadow-card">
          <div className="font-serif text-5xl md:text-6xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            $94 <span className="text-3xl md:text-4xl">USD</span>
          </div>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            The total cost for the Somalia eVisa application service is <strong className="text-foreground">$94 USD</strong>,
            all-inclusive. This fee covers our specialist application assistance, document review,
            and submission through the official Somalia eTAS portal — operated by{" "}
            <strong className="text-foreground">PassKey Technologies Ltd</strong> (Company No. 16877709,
            registered in England &amp; Wales).
          </p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            All fees are displayed clearly before payment is completed. Applicants are advised to
            review the information provided carefully before submitting their application.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-20">
        <SectionHeading
          eyebrow="How it works"
          title="Simple, transparent, professional."
          description="Whether you fill the form yourself or use our Express service, we make the eVisa journey effortless from start to finish."
        />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { icon: UploadCloud, title: "Choose & submit", body: "Pick the path that matches you, then submit your details or documents." },
            { icon: PenLine, title: "We review & process", body: "Our specialists review every document and prepare a complete, accurate application." },
            { icon: BadgeCheck, title: "eVisa to your inbox", body: "Once approved, your eVisa arrives by email and WhatsApp — ready to travel." },
          ].map((c) => (
            <div key={c.title} className="bg-card border border-border rounded-sm p-8 shadow-card hover:shadow-elegant transition-smooth">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-accent-soft text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-serif text-2xl text-primary">{c.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUSTED PARTNER */}
      <section className="container py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img
            src={passportImg}
            alt="Passport ready for travel"
            className="rounded-sm shadow-elegant w-full object-cover aspect-[4/5]"
            loading="lazy"
            width={1280}
            height={1280}
          />
          <div className="absolute -bottom-6 -right-6 hidden md:block bg-gradient-navy text-primary-foreground p-6 rounded-sm shadow-elegant max-w-[220px]">
            <div className="font-serif text-4xl text-accent">10k+</div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70 mt-1">
              Applications assisted
            </div>
          </div>
        </div>
        <div>
          <SectionHeading
            align="left"
            eyebrow="Why choose us"
            title="A partner you can trust for your eVisa."
            description="We make your visa effortless — clear instructions, careful review, and a team ready to help when you need it."
          />
          <ul className="mt-10 space-y-5">
            {[
              "Personal review by an expert",
              "Step-by-step guidance at every stage",
              "Priority, fast-track processing",
              "Bank-grade security for your data",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <span className="text-foreground/85">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-secondary/60 py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Our Services"
            title="Everything you need, from start to finish."
            description="A careful service that lifts the burden of the eVisa application off your shoulders."
          />
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-sm overflow-hidden shadow-card">
            {[
              { icon: FileCheck2, title: "Document Preparation", body: "We make sure every document meets the requirements." },
              { icon: Sparkles, title: "Step-by-Step Guidance", body: "Clear instructions tailored to your country and travel purpose." },
              { icon: Clock4, title: "Fast Processing", body: "Priority review designed for urgent travel." },
              { icon: Headphones, title: "24/7 Support", body: "Talk to a real specialist any time, day or night." },
              { icon: Lock, title: "Secure Data", body: "Bank-grade encryption protects every detail you share." },
              { icon: Plane, title: "Ready to Travel", body: "Receive your eVisa with a concise travel-ready summary." },
            ].map((s) => (
              <div key={s.title} className="bg-card p-10 hover:bg-secondary/40 transition-smooth">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-navy text-accent">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-serif text-xl text-primary">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="rounded-sm bg-primary text-primary-foreground p-12 md:p-16 text-center shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, hsl(var(--accent)/0.4), transparent 50%)" }} />
          <div className="relative">
            <span className="gold-divider mx-auto" />
            <h2 className="mt-6 font-serif text-4xl md:text-5xl">Ready for your journey?</h2>
            <p className="mt-3 font-serif italic text-xl text-primary-foreground/80">Diyaar ma u tahay safarkaaga?</p>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto">
              Submit your eVisa application today and travel with complete confidence.
            </p>
            <a
              href="#top"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="mt-10 inline-flex items-center gap-2 rounded-sm bg-gradient-gold px-8 py-4 text-sm font-medium text-accent-foreground shadow-gold hover:shadow-elegant transition-smooth"
            >
              Apply Now <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

interface MiniUploaderProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
  file: File | null;
  onChange: (f: File) => void;
  onClear: () => void;
  accept: string;
}
const MiniUploader = ({ icon: Icon, label, sublabel, file, onChange, onClear, accept }: MiniUploaderProps) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
      {label}{sublabel && <span className="normal-case tracking-normal italic text-muted-foreground/70"> · {sublabel}</span>}
    </div>
    {file ? (
      <div className="rounded-sm border border-accent/40 bg-accent-soft/40 p-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent shrink-0" />
        <div className="flex-1 min-w-0 text-xs font-medium text-primary truncate">{file.name}</div>
        <button type="button" onClick={onClear} className="text-muted-foreground hover:text-primary">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    ) : (
      <label className="cursor-pointer flex flex-col items-center justify-center text-center rounded-sm border border-dashed border-border hover:border-accent hover:bg-accent-soft/30 px-3 py-5 transition-smooth">
        <UploadCloud className="h-5 w-5 text-accent" />
        <div className="mt-1.5 text-[11px] font-medium text-primary">Upload</div>
        <div className="text-[10px] text-muted-foreground italic">Soo gudbi</div>
        <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])} />
      </label>
    )}
  </div>
);

interface MiniFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
}
const MiniField = ({ icon: Icon, label, sublabel, ...props }: MiniFieldProps) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
      {label}{sublabel && <span className="normal-case tracking-normal italic text-muted-foreground/70"> · {sublabel}</span>}
    </span>
    <div className="relative mt-1.5">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        {...props}
        className="w-full rounded-sm border border-input bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-smooth"
      />
    </div>
  </label>
);

interface MiniSelectProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}
const MiniSelect = ({ icon: Icon, label, sublabel, value, onChange, options, required }: MiniSelectProps) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
      {label}{sublabel && <span className="normal-case tracking-normal italic text-muted-foreground/70"> · {sublabel}</span>}
    </span>
    <div className="relative mt-1.5">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full appearance-none rounded-sm border border-input bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-smooth"
      >
        <option value="">Select country</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  </label>
);

export default Index;
