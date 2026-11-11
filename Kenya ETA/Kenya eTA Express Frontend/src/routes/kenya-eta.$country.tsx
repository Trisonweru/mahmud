import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, Clock, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { guideBySlug, COUNTRY_GUIDES } from "@/lib/eta-countries";
import { money, TOTAL_FEE } from "@/lib/eta-pricing";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/kenya-eta/$country")({
  loader: ({ params }) => {
    const guide = guideBySlug(params.country);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ params, loaderData }) => {
    const guide = loaderData?.guide;
    if (!guide) return {};
    const title = `Kenya eTA for ${guide.demonym} — Requirements, Fees & Processing`;
    const description = `Kenya Standard Single Entry eTA for ${guide.demonym}: required documents, processing time, ${money(TOTAL_FEE)} total fee and a guided online application.`;
    const url = absoluteUrl(`/kenya-eta/${params.country}`);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Kenya eTA by country",
                  item: absoluteUrl("/kenya-eta"),
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: `Kenya eTA for ${guide.demonym}`,
                  item: url,
                },
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: `Do ${guide.demonym} need a visa or eTA for Kenya?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `${guide.demonym} must hold an approved Kenya electronic Travel Authorisation (eTA) before boarding. The eTA replaced the previous visa and visa-on-arrival system.`,
                  },
                },
                {
                  "@type": "Question",
                  name: `How long does the Kenya eTA take for ${guide.demonym}?`,
                  acceptedAnswer: { "@type": "Answer", text: guide.processing },
                },
                {
                  "@type": "Question",
                  name: `How much does the Kenya eTA cost for ${guide.demonym}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `${money(TOTAL_FEE)} USD per traveller, all inclusive.`,
                  },
                },
              ],
            },
          ]),
        },
      ],
    };
  },
  component: CountryPage,
});

function CountryPage() {
  const { guide } = Route.useLoaderData();

  return (
    <>
      <PageHeader
        eyebrow={`Kenya eTA · ${guide.country}`}
        title={`Kenya eTA for ${guide.demonym}`}
        description={`Everything ${guide.demonym} need for the Standard Single Entry eTA: required documents, processing time, fees and a guided application you can finish in minutes.`}
      />

      <Section className="!pb-0">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Clock, label: "Processing time", value: guide.processing },
            {
              icon: CreditCard,
              label: "Total fee",
              value: `${money(TOTAL_FEE)} USD per traveller, all inclusive.`,
            },
            {
              icon: FileText,
              label: "eTA type",
              value: "Standard Single Entry eTA, valid for a stay of up to 90 days.",
            },
          ].map((c) => (
            <div key={c.label} className="rounded-lg border border-border bg-card p-5 shadow-soft">
              <c.icon className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {c.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{c.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold">Do {guide.demonym} need a Kenya eTA or eVisa?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Yes. Kenya replaced its visa and visa-on-arrival system with the electronic Travel
              Authorisation (eTA). {guide.demonym} travelling for tourism, to visit friends and
              family, or transiting through Kenya must apply online and be approved before boarding.{" "}
              {guide.currencyNote}
            </p>

            <h2 className="mt-10 text-2xl font-bold">Key points for {guide.country}</h2>
            <ul className="mt-4 space-y-2.5">
              {guide.highlights.map((h) => (
                <li key={h} className="flex gap-2.5 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-2xl font-bold">Documents you will need</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-semibold">Tourism</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Passport bio-data page</li>
                  <li>Passport-style photo</li>
                  <li>Accommodation booking</li>
                  <li>Airline booking</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-semibold">Friends and family</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Passport bio-data page and photo</li>
                  <li>Invitation letter from your host</li>
                  <li>Identity card of the host</li>
                  <li>Accommodation booking</li>
                  <li>Airline booking</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-semibold">Transit</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Passport bio-data page and photo</li>
                  <li>Flight booking confirmation for the onward flight out of Kenya</li>
                </ul>
              </div>
            </div>

            <h2 className="mt-10 text-2xl font-bold">How to apply from {guide.country}</h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">1. Complete the form.</span> Enter
                your passport details, trip dates, reason for travel and background questions.
              </li>
              <li>
                <span className="font-semibold text-foreground">2. Upload documents.</span> Passport
                page, photo and the supporting documents for your reason for travel.
              </li>
              <li>
                <span className="font-semibold text-foreground">
                  3. Pay and we process your eTA.
                </span>{" "}
                Our team reviews everything, processes your eTA application and emails you the
                approval.
              </li>
            </ol>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-cta shadow-soft">
                <Link to="/apply">Start your eTA application</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/requirements">See full requirements</Link>
              </Button>
            </div>
          </div>

          <aside>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Other nationalities
            </p>
            <ul className="mt-3 space-y-1.5">
              {COUNTRY_GUIDES.filter((g) => g.slug !== guide.slug).map((g) => (
                <li key={g.slug}>
                  <Link
                    to="/kenya-eta/$country"
                    params={{ country: g.slug }}
                    className="text-sm text-muted-foreground underline decoration-dotted hover:text-foreground"
                  >
                    Kenya eTA for {g.demonym}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>
    </>
  );
}
