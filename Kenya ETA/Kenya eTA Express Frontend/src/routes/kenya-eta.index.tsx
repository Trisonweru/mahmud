import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { COUNTRY_GUIDES } from "@/lib/eta-countries";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/kenya-eta/")({
  head: () => ({
    meta: [
      { title: "Kenya eTA by Country — Requirements for Every Nationality" },
      {
        name: "description",
        content:
          "Kenya eTA guides by nationality: requirements, processing times and fees for UK, US, Canadian, Australian, EU, Indian and other passport holders.",
      },
      { property: "og:title", content: "Kenya eTA by Country — Requirements by Nationality" },
      {
        property: "og:description",
        content: "Country-by-country Kenya eTA requirements, processing times and fees.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/kenya-eta") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/kenya-eta") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Kenya eTA guides by country",
          itemListElement: COUNTRY_GUIDES.map((g, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `Kenya eTA for ${g.demonym}`,
            url: absoluteUrl(`/kenya-eta/${g.slug}`),
          })),
        }),
      },
    ],
  }),
  component: Hub,
});

function Hub() {
  return (
    <>
      <PageHeader
        eyebrow="Kenya eTA by country"
        title="Kenya eTA requirements by nationality"
        description="Choose your passport country for the requirements, documents, processing time and fees that apply to your Standard Single Entry eTA."
      />
      <Section>
        <p className="mb-6 max-w-3xl rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Under the Kenya Citizenship and Immigration (Amendment) Rules, 2025, citizens of African
          Union member states are exempt from the eTA, with the exception of Somalia and Libya. East
          African Community citizens, holders of Kenyan permanent residence, valid work permits and
          passes, and passengers in transit who remain within the airport are also exempt. Only
          nationalities that require an eTA are listed below.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COUNTRY_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                to="/kenya-eta/$country"
                params={{ country: g.slug }}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-soft transition-colors hover:border-primary/50"
              >
                <span>
                  <span className="block text-sm font-semibold">Kenya eTA for {g.demonym}</span>
                  <span className="block text-xs text-muted-foreground">{g.country}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
