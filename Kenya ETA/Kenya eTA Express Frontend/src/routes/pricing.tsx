import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { EXPRESS_FEE, EXPRESS_HOURS, money, TOTAL_FEE, TRANSIT_FEE } from "@/lib/eta-pricing";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Kenya eTA Application Fee, $70 All Inclusive" },
      {
        name: "description",
        content: `One all-inclusive fee of ${money(TOTAL_FEE)} USD per applicant for the Kenya eTA (formerly the Kenya eVisa), for Tourism, Family Visit and Transit travel.`,
      },
      { property: "og:title", content: "Kenya eTA Pricing — $70 All Inclusive" },
      {
        property: "og:description",
        content: "One flat all-inclusive fee per applicant — no hidden extras.",
      },
      { property: "og:url", content: absoluteUrl("/pricing") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/pricing") }],
  }),
  component: Pricing,
});

const included = [
  "Simplified guided application form",
  "Manual review of details and documents by an agent",
  "Photo and passport-page quality check",
  "Processing on the official eTA portal on your behalf",
  "Email updates at every stage",
  "24/7 support until a decision is issued",
];

function Pricing() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Applications Fee"
        description={`A single fee of ${money(TOTAL_FEE)} USD is payable per applicant for Standard processing, covering the eTA application, review, processing and support. Express handling is available at ${money(EXPRESS_FEE)} USD, and a Transit eTA is ${money(TRANSIT_FEE)} USD.`}
      />
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="grid gap-5">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-lift sm:p-8">
              <p className="text-sm font-semibold text-primary">
                Standard Single Entry eTA — Tourism or Family Visit
              </p>
              <p className="mt-3 font-sans text-xl font-semibold tracking-tight">
                {money(TOTAL_FEE)}{" "}
                <span className="text-sm font-medium text-muted-foreground">USD</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Payable per applicant. Standard processing — a decision is normally issued within 3
                business days.
              </p>
              <Button asChild size="lg" className="mt-7 w-full bg-cta shadow-soft">
                <Link to="/apply">Start Application</Link>
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Payment is taken once, at the review step, after you have checked your answers.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <p className="text-sm font-semibold text-primary">Transit eTA</p>
              <p className="mt-3 font-sans text-xl font-semibold tracking-tight">
                {money(TRANSIT_FEE)}{" "}
                <span className="text-sm font-medium text-muted-foreground">USD</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                For travellers passing through Kenya. A flight booking confirmation is the only
                supporting document required.
              </p>
            </div>

            <div className="rounded-3xl border border-primary/30 bg-primary-soft/60 p-6 shadow-soft sm:p-8">
              <p className="text-sm font-semibold text-primary">Express processing</p>
              <p className="mt-3 font-sans text-xl font-semibold tracking-tight">
                {money(EXPRESS_FEE)}{" "}
                <span className="text-sm font-medium text-muted-foreground">USD</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Priority handling for urgent travel. Your eTA is returned within {EXPRESS_HOURS}.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <h2 className="text-lg font-semibold">What the fee covers</h2>
            <ul className="mt-4 space-y-2.5">
              {included.map((i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  {i}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
              The all-inclusive fee is non-refundable once an application is processed with the
              Directorate of Immigration Services.
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
