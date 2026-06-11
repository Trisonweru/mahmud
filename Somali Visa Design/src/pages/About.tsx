import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/SectionHeading";
import { Globe2, Shield, Heart, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { PageSEO } from "@/components/PageSEO";

const About = () => (
  <>
    <PageSEO
      title="About eVisa Somalia — Trusted Visa Application Specialists"
      description="We are an independent Somalia eVisa service helping diaspora travellers and international visitors apply accurately and with confidence. Specialist-assisted, secure, 24/7."
      canonical="https://www.evisasomali.com/about"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "url": "https://www.evisasomali.com/about",
        "name": "About eVisa Somalia",
        "description": "An independent Somalia eVisa application service helping diaspora travellers and international visitors apply accurately and with confidence.",
        "publisher": {
          "@type": "Organization",
          "@id": "https://www.evisasomali.com/#org",
          "name": "eVisa Somalia",
          "url": "https://www.evisasomali.com",
          "email": "support@evisasomali.com",
        }
      }}
    />

    {/* Hero */}
    <section className="bg-primary text-primary-foreground py-28 relative overflow-hidden">
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, hsl(var(--accent)/0.5), transparent 50%)" }} />
      <div className="relative container text-center max-w-3xl">
        <span className="text-xs uppercase tracking-[0.25em] text-accent">About Us</span>
        <h1 className="mt-5 font-serif text-5xl md:text-6xl">A trusted partner for your journey.</h1>
        <p className="mt-6 text-primary-foreground/75 text-lg">
          We are an independent service helping travellers — especially Somali diaspora applicants —
          prepare and submit Somalia eVisa applications accurately and with care.
        </p>
      </div>
    </section>

    {/* Who we are */}
    <section className="container py-20 max-w-4xl">
      <SectionHeading eyebrow="Who We Are" title="Independent specialists, not a government agency." />
      <div className="mt-8 space-y-5 text-foreground/85 leading-relaxed">
        <p>
          eVisa Somalia is an independent visa application assistance service operated by
          <strong> PassKey Technologies Ltd</strong>, a private company registered in England &amp; Wales
          (Company No. 16877709), with its registered office at 71–75 Shelton Street, Covent Garden,
          London WC2H 9JQ, United Kingdom.
          We are not affiliated with, endorsed by, or connected to the Somali government or any of its
          departments. We are a third-party service that guides applicants through the Somalia eTAS
          (Electronic Travel Authorisation System) process.
        </p>
        <p>
          Somalia opened its electronic visa system to make entry simpler for international visitors and
          returning diaspora. However, navigating the official portal, uploading documents correctly,
          and ensuring every field is filled accurately can be challenging — especially for first-time
          applicants or those unfamiliar with online government systems. That is the gap we fill.
        </p>
        <p>
          Our specialists review every application before submission. We catch errors, missing
          documents, and formatting issues that commonly cause delays or rejections. The result is a
          faster, smoother experience for our clients — with WhatsApp updates at every step of the way.
        </p>
      </div>
    </section>

    {/* What we do */}
    <section className="bg-secondary/40 border-y border-border py-20">
      <div className="container max-w-5xl">
        <SectionHeading eyebrow="What We Do" title="From application to approval — we handle it." />
        <div className="mt-12 grid md:grid-cols-3 gap-8 text-sm text-foreground/85">
          {[
            {
              step: "01",
              title: "You upload your documents",
              body: "Submit your passport scan, passport-size photo, flight ticket, and travel details through our secure online form. The entire process takes under five minutes.",
            },
            {
              step: "02",
              title: "Our specialists review and submit",
              body: "A trained specialist reviews your application for errors and completeness, then submits it directly to the official Somalia eTAS portal on your behalf.",
            },
            {
              step: "03",
              title: "You receive your eVisa",
              body: "Once approved by the Somali authorities, your eVisa is sent directly to your email address. Most approvals are issued within 72 hours of submission.",
            },
          ].map((item) => (
            <div key={item.step} className="bg-card border border-border rounded-sm p-8 shadow-card">
              <div className="text-xs uppercase tracking-[0.2em] text-accent">{item.step}</div>
              <h3 className="mt-4 font-serif text-xl text-primary">{item.title}</h3>
              <p className="mt-3 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Who can apply + values */}
    <section className="container py-20 grid md:grid-cols-2 gap-16 max-w-5xl">
      <div>
        <SectionHeading align="left" eyebrow="Eligibility" title="Who can apply for the Somalia eVisa?" />
        <ul className="mt-8 space-y-4 text-foreground/85 text-sm">
          {[
            "International travellers visiting Somalia for tourism, business, or family",
            "Somali diaspora holding foreign passports who wish to visit their country of origin",
            "Holders of a passport valid for at least 6 months from the intended arrival date",
            "Applicants with a clear digital passport-size photo and confirmed travel itinerary",
            "Visitors who need a single-entry visa valid for up to 180 days",
          ].map((t) => (
            <li key={t} className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-secondary/60 rounded-sm p-10 border border-border">
        <SectionHeading align="left" eyebrow="Our Values" title="Built on trust and expertise." />
        <div className="mt-8 grid grid-cols-2 gap-6">
          {[
            { icon: Shield, label: "Trusted", body: "Hundreds of applications processed with a near-perfect approval rate." },
            { icon: Heart, label: "Personal", body: "Every application reviewed by a real human specialist, not a bot." },
            { icon: Award, label: "Expert", body: "Deep knowledge of Somalia eTAS requirements and common rejection reasons." },
            { icon: Globe2, label: "Global", body: "Supporting applicants from over 50 countries across 6 continents." },
          ].map((v) => (
            <div key={v.label} className="bg-card p-6 rounded-sm border border-border">
              <v.icon className="h-5 w-5 text-accent" />
              <div className="mt-3 font-serif text-xl text-primary">{v.label}</div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-primary text-primary-foreground py-20">
      <div className="container text-center max-w-2xl">
        <h2 className="font-serif text-4xl">Ready to apply?</h2>
        <p className="mt-4 text-primary-foreground/70">
          Start your Somalia eVisa application today. It takes less than five minutes and our team
          will handle the rest.
        </p>
        <Link
          to="/apply/start"
          className="mt-8 inline-flex items-center gap-2 rounded-sm bg-gradient-gold px-8 py-4 text-sm font-medium text-accent-foreground shadow-gold hover:shadow-elegant transition-smooth"
        >
          Start your application <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  </>
);

export default About;
