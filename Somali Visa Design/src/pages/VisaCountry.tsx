import { Link, Navigate, useParams } from "react-router-dom";
import { SectionHeading } from "@/components/SectionHeading";
import { PageSEO } from "@/components/PageSEO";
import { CheckCircle2, Clock, CreditCard, Globe2, ArrowRight } from "lucide-react";
import { visaCountries } from "@/data/visaCountries";

const requirements = [
  "A valid passport with at least 6 months' validity remaining from your travel date",
  "A recent passport-style photo on a plain, light-coloured background",
  "A clear scanned copy of your passport's bio-data page",
  "Your travel itinerary, including arrival date and accommodation details",
  "An invitation letter or sponsor reference, if applicable",
  "A valid email address to receive your approved eVisa",
];

const VisaCountry = () => {
  const { country } = useParams<{ country: string }>();
  const data = visaCountries.find((c) => c.slug === country);

  if (!data) return <Navigate to="/" replace />;

  const faqs = [
    {
      q: `Do ${data.demonym} citizens need a visa for Somalia?`,
      a: `Yes. ${data.demonym} passport holders must obtain an approved eVisa before travelling to Somalia. eVisaSomali helps you prepare and submit this application online.`,
    },
    {
      q: "How long does processing take?",
      a: "Most applications are reviewed by our specialists and submitted to the official Somalia eTAS portal within 24-48 hours of receiving your complete documents.",
    },
    {
      q: "What does the $94 fee cover?",
      a: "The $94 USD fee is all-inclusive: it covers the official government eTAS fee as well as our specialist review, document checks, and submission service. No hidden charges.",
    },
    {
      q: `Can I apply from ${data.country}?`,
      a: `Yes. The application is completed entirely online, so you can apply from anywhere in ${data.country} (or abroad), regardless of your departure location.`,
    },
  ];

  return (
    <>
      <PageSEO
        title={`Somalia eVisa for ${data.demonym} Citizens | eVisaSomali`}
        description={`Apply for your Somalia eVisa from ${data.country}. ${data.intro}`}
        canonical={`https://www.evisasomali.com/visa/${data.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map((f) => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a },
          })),
        }}
      />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, hsl(var(--accent)/0.5), transparent 50%)" }} />
        <div className="relative container text-center max-w-3xl">
          <span className="text-xs uppercase tracking-[0.25em] text-accent">{data.flag} {data.country}</span>
          <h1 className="mt-5 font-serif text-5xl md:text-6xl">Somalia eVisa for {data.demonym} Citizens</h1>
          <p className="mt-6 text-primary-foreground/75 text-lg">{data.intro}</p>
          <Link
            to="/apply/start"
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-gradient-gold px-8 py-4 text-sm font-medium text-accent-foreground shadow-gold hover:shadow-elegant transition-smooth"
          >
            Start your application — $94 USD <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Key details */}
      <section className="container py-20">
        <SectionHeading eyebrow="Key Details" title={`What ${data.demonym} travellers need to know`} />
        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Clock, title: "Processing Time", body: "Most applications are reviewed and submitted within 24-48 hours of receiving your complete documents." },
            { icon: CreditCard, title: "Visa Fee", body: "$94 USD, all-inclusive — covers the official government eTAS fee and our specialist service. No hidden charges." },
            { icon: Globe2, title: "Validity", body: "Single or multiple-entry options available, valid for up to 180 days from the date of issue." },
          ].map((d) => (
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
          <SectionHeading eyebrow="Requirements" title={`Documents ${data.demonym} citizens need`} />
          <ul className="mt-10 space-y-4 text-sm text-foreground/85">
            {requirements.map((r) => (
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
        <SectionHeading eyebrow={data.country} title="Helping you travel with confidence" description={data.highlight} />
      </section>

      {/* FAQ */}
      <section className="bg-secondary/40 border-y border-border py-20">
        <div className="container max-w-3xl">
          <SectionHeading eyebrow="FAQ" title={`${data.country} — Frequently Asked Questions`} />
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
};

export default VisaCountry;
