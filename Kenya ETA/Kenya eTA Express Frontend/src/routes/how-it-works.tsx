import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Kenya eTA Assistance" },
      {
        name: "description",
        content:
          "Four simple stages: fill the guided form, upload documents, we review and process your eTA, you receive your Kenya eTA by email.",
      },
      { property: "og:title", content: "How It Works — Kenya eTA Assistance" },
      {
        property: "og:description",
        content: "From guided form to approved eTA in your inbox, explained step by step.",
      },
      { property: "og:url", content: absoluteUrl("/how-it-works") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/how-it-works") }],
  }),
  component: HowItWorks,
});

const stages = [
  {
    step: "01",
    title: "Complete the guided form",
    body: "Six short steps ask only what the Kenya eTA needs for Tourism, Friends and Family, or Transit travel: nationality, travel dates, passport details, contact information and where you will stay.",
    time: "About 8 minutes",
  },
  {
    step: "02",
    title: "Upload your documents",
    body: "Add a clear photo of your passport bio-data page and a passport-style photo. Each upload shows a preview and examples so you know it is acceptable.",
    time: "About 2 minutes",
  },
  {
    step: "03",
    title: "We review and process",
    body: "An agent checks names, dates, passport validity and image quality, contacts you if anything needs fixing, then processes your eTA application on the official portal.",
    time: "Usually within 12 hours",
  },
  {
    step: "04",
    title: "Receive your eTA",
    body: "Your approved eTA arrives by email as a PDF. Print it or keep it on your phone and show it on arrival with your passport.",
    time: "Typically within 3 business days",
  },
];

function HowItWorks() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="From application to approved eTA"
        description="We simplify the official process into four clear stages, with a human check before anything is processed."
      />
      <Section>
        <ol className="space-y-5">
          {stages.map((s) => (
            <li
              key={s.step}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:flex sm:gap-6"
            >
              <span className="font-display text-3xl font-bold text-primary/40">{s.step}</span>
              <div className="mt-3 sm:mt-0">
                <h2 className="text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
                <p className="mt-3 inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {s.time}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-cta shadow-soft">
            <Link to="/apply">Start Application</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/requirements">Check requirements first</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
