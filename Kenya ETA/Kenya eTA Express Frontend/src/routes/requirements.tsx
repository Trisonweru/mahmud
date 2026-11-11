import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/requirements")({
  head: () => ({
    meta: [
      { title: "Requirements — Kenya Standard Single Entry eTA" },
      {
        name: "description",
        content:
          "What you need for a Kenya Standard Single Entry eTA: valid passport, bio-data page scan, passport-style photo, travel dates and accommodation details.",
      },
      { property: "og:title", content: "Kenya eTA Requirements" },
      {
        property: "og:description",
        content: "Passport, photo and travel details you need before you apply.",
      },
      { property: "og:url", content: absoluteUrl("/requirements") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/requirements") }],
  }),
  component: Requirements,
});

const groups = [
  {
    title: "Your passport",
    items: [
      "Ordinary passport valid for at least 6 months from your arrival date",
      "At least one blank page for entry stamps",
      "Clear photo or scan of the bio-data page (the page with your photo)",
    ],
  },
  {
    title: "Your photo",
    items: [
      "Recent passport-style photo taken in the last 6 months",
      "Plain light background, face centred and fully visible",
      "No hats, sunglasses or filters; neutral expression",
    ],
  },
  {
    title: "Trip details",
    items: ["Planned arrival and departure dates", "Hotel or host name and address in Kenya"],
  },
  {
    title: "Contact details",
    items: [
      "Email address you check regularly — your eTA is sent there",
      "Phone number with country code in case we need a quick clarification",
    ],
  },
];

function Requirements() {
  return (
    <>
      <PageHeader
        eyebrow="Requirements"
        title="What you need before you apply"
        description="Everything below applies to the Kenya eTA for all three reasons for travel — Tourism, Friends and Family, and Transit. Have it ready and the form takes about ten minutes."
      />
      <Section>
        <div className="grid gap-5 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-semibold">{g.title}</h2>
              <ul className="mt-3 space-y-2">
                {g.items.map((i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3 rounded-3xl border border-border bg-secondary/50 p-6">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold">Good to know</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The Standard Single Entry eTA allows one entry into Kenya and a stay of up to 90 days.
              It must be approved before you travel, and it is tied to the passport you apply with.
              Apply at least 7 days before departure where possible.
            </p>
          </div>
        </div>

        <Button asChild size="lg" className="mt-8 bg-cta shadow-soft">
          <Link to="/apply">Start Application</Link>
        </Button>
      </Section>
    </>
  );
}
