import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/SectionHeading";
import { Globe2, Shield, Heart, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { PageSEO } from "@/components/PageSEO";
import { SITE } from "@/config/site";
import content from "@site-content";

const a = content.about;

const About = () => (
  <>
    <PageSEO
      title={a.seoTitle}
      description={a.seoDescription}
      canonical={`${SITE.url}/about`}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "url": `${SITE.url}/about`,
        "name": `About ${SITE.brand}`,
        "description": a.schemaDescription,
        "publisher": {
          "@type": "Organization",
          "@id": `${SITE.url}/#org`,
          "name": `${SITE.brand}`,
          "url": `${SITE.url}`,
          "email": `${SITE.email}`,
        }
      }}
    />

    {/* Hero */}
    <section className="bg-primary text-primary-foreground py-28 relative overflow-hidden">
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, hsl(var(--accent)/0.5), transparent 50%)" }} />
      <div className="relative container text-center max-w-3xl">
        <span className="text-xs uppercase tracking-[0.25em] text-accent">{a.heroEyebrow}</span>
        <h1 className="mt-5 font-serif text-5xl md:text-6xl">{a.heroTitle}</h1>
        <p className="mt-6 text-primary-foreground/75 text-lg">{a.heroBody}</p>
      </div>
    </section>

    {/* Who we are */}
    <section className="container py-20 max-w-4xl">
      <SectionHeading eyebrow={a.whoEyebrow} title={a.whoTitle} />
      <div className="mt-8 space-y-5 text-foreground/85 leading-relaxed">
        <p>
          <strong>{SITE.domain}</strong> is an independent visa application assistance service,
          a trading name of Passkey Technologies Limited, registered in England &amp; Wales
          (Company No. 16877709), with its registered office at 71–75 Shelton Street, Covent Garden,
          London WC2H 9JQ, United Kingdom.
          We are not affiliated with, endorsed by, or connected to the Somali government or any of its
          departments. We are a third-party service that guides applicants through the Somalia eTAS
          (Electronic Travel Authorisation System) process.
        </p>
        {a.whoParagraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </section>

    {/* What we do */}
    <section className="bg-secondary/40 border-y border-border py-20">
      <div className="container max-w-5xl">
        <SectionHeading eyebrow={a.whatEyebrow} title={a.whatTitle} />
        <div className="mt-12 grid md:grid-cols-3 gap-8 text-sm text-foreground/85">
          {a.whatSteps.map((st, n) => ({ ...st, step: String(n + 1).padStart(2, "0") })).map((item) => (
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
        <SectionHeading align="left" eyebrow={a.eligibilityEyebrow} title={a.eligibilityTitle} />
        <ul className="mt-8 space-y-4 text-foreground/85 text-sm">
          {a.eligibility.map((t) => (
            <li key={t} className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-secondary/60 rounded-sm p-10 border border-border">
        <SectionHeading align="left" eyebrow={a.valuesEyebrow} title={a.valuesTitle} />
        <div className="mt-8 grid grid-cols-2 gap-6">
          {a.values.map((v, n) => ({ ...v, icon: [Shield, Heart, Award, Globe2][n] })).map((v) => (
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
        <h2 className="font-serif text-4xl">{a.ctaTitle}</h2>
        <p className="mt-4 text-primary-foreground/70">{a.ctaBody}</p>
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
