import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { EXPRESS_FEE, EXPRESS_HOURS, money, TOTAL_FEE, TRANSIT_FEE } from "@/lib/eta-pricing";
import { CONTACT } from "@/lib/site-contact";
import { absoluteUrl } from "@/lib/seo";

const faqs = [
  {
    q: "What is the Kenya eTA?",
    a: "The Electronic Travel Authorisation (eTA) is an online approval you must hold before travelling to Kenya. It replaced the old Kenya eVisa, so if you were looking for a Kenya eVisa, the eTA is what you now need. We process applications for Tourism, Friends and Family, and Transit travel.",
  },
  {
    q: "Which types of travel do you process?",
    a: "We handle three reasons for travel: Tourism, visiting Friends and Family, and Transit. Each has its own supporting document list, which the application form shows you as soon as you choose your reason for travel.",
  },
  {
    q: "How much does it cost?",
    a: `Standard processing is ${money(TOTAL_FEE)} USD per applicant, all inclusive. A Transit eTA is ${money(TRANSIT_FEE)} USD per applicant. Express processing is ${money(EXPRESS_FEE)} USD per applicant. Nothing else is added at checkout.`,
  },
  {
    q: "How long does approval take?",
    a: `Under standard processing, the official decision is normally issued within 3 business days of the application being processed. Express processing returns the eTA within ${EXPRESS_HOURS}. Apply at least three days before departure.`,
  },
  {
    q: "What documents do I need?",
    a: "A passport valid for at least 6 months from arrival, a clear photo or scan of the passport bio-data page, and a recent passport-style photo on a plain background.",
  },
  {
    q: "Can I apply for my family in one go?",
    a: "Each traveller needs their own eTA, including children. Apply once per person; you can use the same email address for all of them.",
  },
  {
    q: "What if I made a mistake in my application?",
    a: "Contact us with your reference number as soon as possible. If we have not yet processed it, we correct it at no extra cost. After processing, a correction may require a new application and a new fee.",
  },
  {
    q: "What happens if my eTA is refused?",
    a: "We send you the reason from the immigration authority and explain your options. The application fee is non-refundable once an application is processed.",
  },
  {
    q: "How can I get assistance?",
    a: `Email us at ${CONTACT.email}. We reply around the clock, usually within two hours.`,
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Kenya Standard Single Entry eTA" },
      {
        name: "description",
        content:
          "Answers about the Kenya Standard Single Entry eTA: costs, processing times, documents, corrections and refusals.",
      },
      { property: "og:title", content: "Kenya eTA — Frequently Asked Questions" },
      {
        property: "og:description",
        content: "Costs, processing times, documents and what happens if something goes wrong.",
      },
      { property: "og:url", content: absoluteUrl("/faq") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/faq") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Straight answers about the Standard Single Entry eTA and how our assistance service works."
      />
      <Section>
        <Accordion
          type="single"
          collapsible
          className="rounded-3xl border border-border bg-card px-5 shadow-soft"
        >
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-cta shadow-soft">
            <Link to="/apply">Start Application</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/contact">Ask a question</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
