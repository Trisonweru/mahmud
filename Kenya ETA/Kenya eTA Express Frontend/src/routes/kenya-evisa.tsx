import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { absoluteUrl } from "@/lib/seo";
import {
  EXPRESS_FEE,
  EXPRESS_HOURS,
  money,
  STANDARD_TIME,
  TOTAL_FEE,
  TRANSIT_FEE,
} from "@/lib/eta-pricing";
import { COUNTRY_GUIDES } from "@/lib/eta-countries";

const FAQS = [
  {
    q: "Is the Kenya eVisa still available?",
    a: "No. The Kenya eVisa is no longer issued. Travellers now apply for the Electronic Travel Authorisation (eTA), which is the entry authorisation required for travel to Kenya.",
  },
  {
    q: "What is the difference between the Kenya eVisa and the Kenya eTA?",
    a: "Both are applied for online before travel. The eTA replaced the eVisa and is now the authorisation airlines and border officers check. Applications are accepted for three reasons for travel: Tourism, Friends and Family, and Transit.",
  },
  {
    q: "I was told I need a Kenya eVisa. What should I apply for?",
    a: "Apply for the Kenya eTA. Many airlines, agents and older travel guides still use the word eVisa, but the eTA is the document you will need to board.",
  },
  {
    q: "How much does it cost?",
    a: `A single all-inclusive fee of ${money(TOTAL_FEE)} USD per applicant for the Standard Single Entry eTA. A Transit eTA is ${money(TRANSIT_FEE)} USD per applicant. Express handling is ${money(EXPRESS_FEE)} USD per applicant.`,
  },
  {
    q: "How long does the Kenya eTA take?",
    a: `An official decision is normally issued ${STANDARD_TIME}. With Express handling the eTA is returned within ${EXPRESS_HOURS}.`,
  },
  {
    q: "Which documents do I need?",
    a: "A passport valid for at least six months from arrival, a recent passport-style photograph, and supporting documents for your reason for travel — accommodation or itinerary for Tourism, an invitation for a Family Visit, or a flight booking confirmation for Transit.",
  },
];

export const Route = createFileRoute("/kenya-evisa")({
  head: () => ({
    meta: [
      { title: "Kenya eVisa: Now the Kenya eTA — Apply Online from $70" },
      {
        name: "description",
        content:
          "The Kenya eVisa is no longer issued: travellers now apply for the Kenya eTA. See what changed, documents required, fees from $70 and processing times.",
      },
      { property: "og:title", content: "Kenya eVisa is now the Kenya eTA" },
      {
        property: "og:description",
        content:
          "What replaced the Kenya eVisa, which documents you need, and how to apply for the Kenya eTA online.",
      },
      { property: "og:url", content: absoluteUrl("/kenya-evisa") },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/kenya-evisa") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: EVisaPage,
});

function EVisaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kenya eVisa"
        title="Kenya eVisa is now the Kenya eTA"
        description="The Kenya eVisa is no longer issued. The Electronic Travel Authorisation (eTA) is the entry authorisation required for travel to Kenya, applied for online before departure."
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
            <h2 className="text-2xl font-bold">What changed</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Travellers who previously applied for a Kenya eVisa now complete an eTA application
              instead. The process is still entirely online and still completed before travel, but
              the authorisation issued is the Electronic Travel Authorisation. Airlines check the
              eTA at the gate and border officers check it on arrival.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Applications are accepted for three reasons for travel: Tourism, Friends and Family,
              and Transit. Each reason has its own supporting documents, which you upload during the
              application.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-cta shadow-soft">
                <Link to="/apply">Start your eTA application</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/requirements">See required documents</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Info className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">eVisa vs eTA at a glance</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-semibold">Kenya eVisa</dt>
                <dd className="text-muted-foreground">No longer issued.</dd>
              </div>
              <div>
                <dt className="font-semibold">Kenya eTA</dt>
                <dd className="text-muted-foreground">
                  Current authorisation. Applied for online, single entry, Tourism, Friends and
                  Family or Transit.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Visa on arrival</dt>
                <dd className="text-muted-foreground">
                  Not an alternative — the authorisation must be held before boarding.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="text-2xl font-bold sm:text-3xl">Fees and processing times</h2>
        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Application type
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Fee per applicant
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Processing
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3">Standard Single Entry eTA — Tourism or Family Visit</td>
                <td className="px-4 py-3 font-semibold">{money(TOTAL_FEE)} all inclusive</td>
                <td className="px-4 py-3 text-muted-foreground">{STANDARD_TIME}</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Transit eTA</td>
                <td className="px-4 py-3 font-semibold">{money(TRANSIT_FEE)} all inclusive</td>
                <td className="px-4 py-3 text-muted-foreground">{STANDARD_TIME}</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Express handling</td>
                <td className="px-4 py-3 font-semibold">{money(EXPRESS_FEE)} all inclusive</td>
                <td className="px-4 py-3 text-muted-foreground">Within {EXPRESS_HOURS}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/pricing">Full fee details</Link>
        </Button>
      </Section>

      <Section className="pt-0">
        <h2 className="text-2xl font-bold sm:text-3xl">Documents you will need</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            "Passport valid for at least 6 months from your arrival date",
            "Recent passport-style photograph",
            "Accommodation details or itinerary (Tourism)",
            "Invitation or host details (Friends and Family)",
            "Flight booking confirmation (Transit)",
            "A working email address for your decision",
          ].map((d) => (
            <li
              key={d}
              className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4 text-sm shadow-soft"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              {d}
            </li>
          ))}
        </ul>
      </Section>

      <Section className="pt-0">
        <h2 className="text-2xl font-bold sm:text-3xl">Kenya eVisa questions answered</h2>
        <div className="mt-5 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-foreground">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-2xl font-bold">Requirements for your nationality</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Requirements, processing times and fees for your passport country.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {COUNTRY_GUIDES.map((g) => (
              <li key={g.slug}>
                <Link
                  to="/kenya-eta/$country"
                  params={{ country: g.slug }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Kenya eTA for {g.demonym}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
