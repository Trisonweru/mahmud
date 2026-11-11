import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Globe2, Plane, Users } from "lucide-react";
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
    q: "Do I need a visa for Kenya?",
    a: "Most travellers no longer apply for a visa. Kenya requires an Electronic Travel Authorisation (eTA), applied for online before departure. It replaced both the Kenya eVisa and visa on arrival.",
  },
  {
    q: "Can I get a Kenya visa on arrival?",
    a: "No. The authorisation must be approved before you board your flight, so applying on arrival is not an option.",
  },
  {
    q: "Which types of Kenya eTA can I apply for here?",
    a: "Tourism, Friends and Family (family visit), and Transit. Express handling is available on top of any of these.",
  },
  {
    q: "How much is a Kenya visa?",
    a: `The Standard Single Entry eTA is ${money(TOTAL_FEE)} USD per applicant, all inclusive. A Transit eTA is ${money(TRANSIT_FEE)} USD per applicant. Express handling is ${money(EXPRESS_FEE)} USD per applicant.`,
  },
  {
    q: "How long is the Kenya eTA valid for?",
    a: "The Standard Single Entry eTA allows one entry, with a stay of up to 90 days.",
  },
  {
    q: "Which nationalities can apply?",
    a: "Applications are accepted from passport holders worldwide. Some African nationals are exempt, so check the exemption rules for your passport before paying.",
  },
];

const TYPES = [
  {
    icon: Globe2,
    title: "Tourism",
    body: "For holidays, safaris and beach travel. Upload accommodation details or your itinerary.",
    fee: TOTAL_FEE,
  },
  {
    icon: Users,
    title: "Friends and Family",
    body: "For visiting relatives or friends in Kenya. Upload your host's invitation and identification.",
    fee: TOTAL_FEE,
  },
  {
    icon: Plane,
    title: "Transit",
    body: "For passing through Kenya to another destination. Upload your flight booking confirmation.",
    fee: TRANSIT_FEE,
  },
];

export const Route = createFileRoute("/kenya-visa")({
  head: () => ({
    meta: [
      { title: "Kenya Visa Requirements 2026 — Apply Online for the Kenya eTA" },
      {
        name: "description",
        content:
          "Kenya visa requirements explained: the eTA replaced the Kenya visa and eVisa. Compare Tourism, Family Visit and Transit, fees from $70 and processing times.",
      },
      { property: "og:title", content: "Kenya Visa Requirements — Apply for the Kenya eTA" },
      {
        property: "og:description",
        content:
          "What travellers from any country need for Kenya: eTA types, documents, fees and processing times.",
      },
      { property: "og:url", content: absoluteUrl("/kenya-visa") },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/kenya-visa") }],
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
  component: VisaPage,
});

function VisaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kenya visa requirements"
        title="Kenya visa requirements for travellers worldwide"
        description="Kenya no longer issues the visa on arrival or the eVisa. Travellers of every nationality apply online for an Electronic Travel Authorisation (eTA) before departure."
      />

      <Section>
        <h2 className="text-2xl font-bold sm:text-3xl">Which application applies to you</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {TYPES.map((t) => (
            <div key={t.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <t.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              <p className="mt-4 font-sans text-xl font-semibold tracking-tight">
                {money(t.fee)}{" "}
                <span className="text-sm font-medium text-muted-foreground">USD all inclusive</span>
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Express handling is available at {money(EXPRESS_FEE)} USD per applicant, returned within{" "}
          {EXPRESS_HOURS}. Standard applications receive an official decision {STANDARD_TIME}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="bg-cta shadow-soft">
            <Link to="/apply">Start your application</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/kenya-evisa">Kenya eVisa explained</Link>
          </Button>
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="text-2xl font-bold sm:text-3xl">Kenya visa or eTA — what changed</h2>
        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Route
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3">Kenya visa on arrival</td>
                <td className="px-4 py-3 text-muted-foreground">No longer available</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Kenya eVisa</td>
                <td className="px-4 py-3 text-muted-foreground">No longer issued</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Kenya eTA (Electronic Travel Authorisation)</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Current requirement — applied for online before travel
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="text-2xl font-bold sm:text-3xl">Requirements by passport country</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Guides for travellers across Europe, the Americas, Africa, the Middle East, Asia and
          Oceania.
        </p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {COUNTRY_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                to="/kenya-eta/$country"
                params={{ country: g.slug }}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-soft transition-colors hover:text-foreground"
              >
                Kenya eTA for {g.demonym}
                <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="pt-0">
        <h2 className="text-2xl font-bold sm:text-3xl">Kenya visa questions answered</h2>
        <div className="mt-5 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
