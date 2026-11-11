import { SectionHeading } from "@/components/SectionHeading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageSEO } from "@/components/PageSEO";
import { SITE } from "@/config/site";
import content from "@site-content";

const faqs = content.faqs.items;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((f) => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a },
  })),
};

const FAQs = () => (
  <>
    <PageSEO
      title={content.faqs.seoTitle}
      description={content.faqs.seoDescription}
      canonical={`${SITE.url}/faqs`}
      jsonLd={faqJsonLd}
    />
    <section className="container py-20 max-w-3xl">
      <SectionHeading as="h1" eyebrow={content.faqs.eyebrow} title={content.faqs.title} description={content.faqs.description} />
      <Accordion type="single" collapsible className="mt-12 space-y-3">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border border-border rounded-sm bg-card px-6 shadow-card">
            <AccordionTrigger className="text-left font-serif text-lg text-primary hover:no-underline py-5">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  </>
);

export default FAQs;
