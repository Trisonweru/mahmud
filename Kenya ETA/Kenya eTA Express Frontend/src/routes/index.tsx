import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Mail, MessageCircle, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/PageHeader";
import {
  EXPRESS_FEE,
  EXPRESS_HOURS,
  money,
  PRICING,
  TOTAL_FEE,
  TRANSIT_FEE,
} from "@/lib/eta-pricing";
import { CONTACT } from "@/lib/site-contact";
import { COUNTRY_GUIDES } from "@/lib/eta-countries";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import heroImage from "@/assets/kenya-hero-safari.jpg";
import safariImage from "@/assets/kenya-safari.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kenya eTA & eVisa Application — Apply Online, $70" },
      {
        name: "description",
        content:
          "Apply online for the Kenya eTA (the Kenya eVisa replacement) from any country — Tourism, Friends and Family or Transit. Guided form, document check and support, $70 all inclusive.",
      },
      {
        property: "og:title",
        content: "Kenya eTA Application — eTA for All Nationalities",
      },
      {
        property: "og:description",
        content:
          "Guided Kenya eTA application with document checks and 24/7 support. Clear all-in pricing.",
      },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:type", content: "website" },
      { property: "og:image", content: absoluteUrl(heroImage) },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: absoluteUrl(heroImage) },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Kenya eTA application assistance",
          serviceType: "Travel authorisation application assistance",
          provider: { "@type": "Organization", name: "Kenyaevisa.net", url: SITE_URL },
          areaServed: "Worldwide",
          offers: {
            "@type": "Offer",
            price: String(TOTAL_FEE),
            priceCurrency: PRICING.currency,
            description: `All-inclusive Kenya eTA application fee of ${money(TOTAL_FEE)} USD per applicant.`,
          },
        }),
      },
    ],
  }),

  component: Home,
});

function Home() {
  return (
    <>
      <section className="bg-hero">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary shadow-soft">
              <ShieldCheck className="size-3.5" aria-hidden="true" /> Tourism, Family Visit &
              Transit eTA
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] sm:text-5xl">
              Apply for Your Kenya eTA Easily
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              The Electronic Travel Authorisation (eTA) is the entry authorisation required for
              travel to Kenya. It replaced the Kenya eVisa, which is no longer issued. Applications
              are accepted for three reasons for travel: Tourism, Friends and Family, and Transit.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-cta shadow-lift">
                <Link to="/apply">Start Application</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/track">Check application status</Link>
              </Button>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {[
                "6 short steps",
                "Document check included",
                `${money(TOTAL_FEE)} all inclusive`,
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-accent" aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Hot air balloon over the Maasai Mara at sunrise with a wildebeest herd below"
              width={1280}
              height={960}
              className="w-full rounded-3xl border border-border object-cover shadow-lift"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-soft backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Clock className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Typical review time</p>
                  <p className="text-xs text-muted-foreground">Reviewed within 12 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section className="pt-0">
        <div className="grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-soft sm:grid-cols-2 sm:p-8">
          <div>
            <h2 className="text-2xl font-bold">Applications Fee</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A single fee of {money(TOTAL_FEE)} USD is payable per applicant. It covers the eTA
              application, document review, processing and applicant support.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Express handling is available at {money(EXPRESS_FEE)} USD per applicant, with the eTA
              returned within {EXPRESS_HOURS}.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              A Transit eTA is {money(TRANSIT_FEE)} USD per applicant.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/pricing">See full pricing</Link>
            </Button>
          </div>
          <div className="grid gap-3 self-center">
            <div className="rounded-2xl bg-secondary/50 p-5 text-center">
              <p className="font-sans text-xl font-semibold tracking-tight">{money(TOTAL_FEE)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Standard — 3 business days</p>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary-soft/60 p-5 text-center">
              <p className="font-sans text-xl font-semibold tracking-tight">{money(EXPRESS_FEE)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Express — within {EXPRESS_HOURS}</p>
            </div>
            <div className="rounded-2xl bg-secondary/50 p-5 text-center">
              <p className="font-sans text-xl font-semibold tracking-tight">{money(TRANSIT_FEE)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Transit — per applicant</p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid items-center gap-8 rounded-3xl border border-border bg-card p-6 shadow-soft lg:grid-cols-2 sm:p-8">
          <img
            src={safariImage}
            alt="Giraffes and zebras on the Kenyan savannah at sunset with an acacia tree"
            width={1600}
            height={912}
            loading="lazy"
            className="w-full rounded-2xl border border-border object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Kenya is waiting</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              From the Maasai Mara to Amboseli and the Diani coast, your trip starts with an
              approved eTA. Get the paperwork right once and spend the rest of your time planning
              game drives, not forms.
            </p>
            <Button asChild className="mt-6 bg-cta shadow-soft">
              <Link to="/apply">Start Application</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Search className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">Check your application status</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Already applied? Enter your reference number and email to see exactly where your eTA
              is in the process.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/track">Check status</Link>
            </Button>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-foreground">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">For assistance</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <a
                href={`mailto:${CONTACT.email}`}
                className="underline decoration-dotted hover:text-foreground"
              >
                {CONTACT.email}
              </a>
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Support is available 24/7 with replies usually within two hours.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Kenya visa, eVisa and eTA — what to apply for
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          If you were searching for a Kenya visa or a Kenya eVisa, the eTA is what you now need.
          These guides explain the change and the documents required.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Link
            to="/kenya-visa"
            className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-colors hover:border-primary/50"
          >
            <h3 className="text-lg font-semibold">Kenya visa requirements</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Who needs an authorisation, the three application types and current fees.
            </p>
          </Link>
          <Link
            to="/kenya-evisa"
            className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-colors hover:border-primary/50"
          >
            <h3 className="text-lg font-semibold">Kenya eVisa explained</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The Kenya eVisa is no longer issued — see what replaced it and how to apply.
            </p>
          </Link>
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="text-2xl font-bold sm:text-3xl">Kenya eTA by nationality</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Requirements, processing times and fees for your passport country — travellers worldwide,
          including the Kenya eTA for UK citizens, US citizens, Indian, Emirati, Chinese and other
          passport holders. Citizens of African Union member states (except Somalia and Libya) are
          exempt from the eTA and are not listed here.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {COUNTRY_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                to="/kenya-eta/$country"
                params={{ country: g.slug }}
                className="inline-flex rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-soft transition-colors hover:text-foreground"
              >
                Kenya eTA for {g.demonym}
              </Link>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/kenya-eta">Browse all country guides</Link>
        </Button>
      </Section>
    </>
  );
}
