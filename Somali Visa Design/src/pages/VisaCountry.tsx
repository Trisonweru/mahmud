import { Link, useParams } from "react-router-dom";
import NotFound from "./NotFound";
import { SectionHeading } from "@/components/SectionHeading";
import { PageSEO } from "@/components/PageSEO";
import { CheckCircle2, Clock, CreditCard, Globe2, ArrowRight } from "lucide-react";
import { visaCountries, visaCountriesSorted } from "@/data/visaCountries";
import { SITE } from "@/config/site";
import content from "@site-content";

const VisaCountry = () => {
  const { country } = useParams<{ country: string }>();
  const data = visaCountries.find((c) => c.slug === country);

  if (!data) return <NotFound />;

  const related = visaCountriesSorted.filter((c) => c.region === data.region && c.slug !== data.slug).slice(0, 12);

  const copy = content.country(data);
  const faqs = copy.faqs;

  return (
    <>
      <PageSEO
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonical={`${SITE.url}/visa/${data.slug}`}
        jsonLd={[
          {
            "@type": "FAQPage",
            "mainEntity": faqs.map((f) => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": { "@type": "Answer", "text": f.a },
            })),
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE.url}/` },
              { "@type": "ListItem", "position": 2, "name": "Visas by Nationality", "item": `${SITE.url}/visa` },
              { "@type": "ListItem", "position": 3, "name": copy.breadcrumb, "item": `${SITE.url}/visa/${data.slug}` },
            ],
          },
        ]}
      />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, hsl(var(--accent)/0.5), transparent 50%)" }} />
        <div className="relative container text-center max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-primary-foreground/60">
            <Link to="/" className="hover:text-accent">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/visa" className="hover:text-accent">Visas by Nationality</Link>
            <span className="mx-2">/</span>
            <span className="text-primary-foreground/80">{data.country}</span>
          </nav>
          <span className="text-xs uppercase tracking-[0.25em] text-accent">{data.flag} {data.country}</span>
          <h1 className="mt-5 font-serif text-5xl md:text-6xl">{copy.h1}</h1>
          <p className="mt-6 text-primary-foreground/75 text-lg">{copy.intro}</p>
          <Link
            to="/apply/start"
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-gradient-gold px-8 py-4 text-sm font-medium text-accent-foreground shadow-gold hover:shadow-elegant transition-smooth"
          >
            {copy.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Key details */}
      <section className="container py-20">
        <SectionHeading eyebrow={copy.detailsEyebrow} title={copy.detailsTitle} />
        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {copy.details.map((d, i) => ({ ...d, icon: [Clock, CreditCard, Globe2][i] })).map((d) => (
            <div key={d.title} className="bg-card border border-border rounded-sm p-8 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-navy text-accent">
                <d.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-serif text-xl text-primary">{d.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-secondary/40 border-y border-border py-20">
        <div className="container max-w-3xl">
          <SectionHeading eyebrow={copy.requirementsEyebrow} title={copy.requirementsTitle} />
          <ul className="mt-10 space-y-4 text-sm text-foreground/85">
            {copy.requirements.map((r) => (
              <li key={r} className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Highlight */}
      <section className="container py-20 max-w-3xl">
        <SectionHeading eyebrow={copy.highlightEyebrow} title={copy.highlightTitle} description={copy.highlight} />
      </section>

      {/* FAQ */}
      <section className="bg-secondary/40 border-y border-border py-20">
        <div className="container max-w-3xl">
          <SectionHeading eyebrow="FAQ" title={copy.faqTitle} />
          <div className="mt-12 space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="bg-card border border-border rounded-sm p-6 shadow-card">
                <h3 className="font-serif text-lg text-primary">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related nationalities */}
      {related.length > 0 && (
        <section className="container py-20 max-w-5xl">
          <SectionHeading eyebrow={data.region} title={copy.relatedTitle} />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/visa/${c.slug}`}
                  className="flex items-center gap-3 rounded-sm border border-border bg-card p-4 text-sm shadow-card transition-smooth hover:border-accent/60"
                >
                  <span aria-hidden="true">{c.flag}</span>
                  <span className="text-foreground">{copy.relatedLabel(c.country)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <Link to="/visa" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
              View all nationalities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container text-center max-w-2xl">
          <h2 className="font-serif text-4xl">{copy.ctaTitle}</h2>
          <p className="mt-4 text-primary-foreground/70">{copy.ctaBody}</p>
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
};

export default VisaCountry;
