import { SectionHeading } from "@/components/SectionHeading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageSEO } from "@/components/PageSEO";

const faqs = [
  {
    q: "How long does a Somalia eVisa application take?",
    a: "Most applications are reviewed and processed within 72 hours of submission. Expedited processing is available for urgent travel — contact our team via WhatsApp for priority handling.",
  },
  {
    q: "How much does the Somalia eVisa cost?",
    a: "Our all-inclusive service fee is $94 USD per application. This covers specialist preparation, submission, document review, and post-approval support. The fee is for a single-entry eVisa valid for up to 180 days.",
  },
  {
    q: "What documents do I need for a Somalia eVisa?",
    a: "You will need: (1) a valid passport with at least 6 months validity, (2) a recent passport-style photo, (3) proof of onward travel or a confirmed flight ticket, and (4) basic personal details. Diaspora (Qurba-Joog) applicants using our Express service simply upload these — our specialists prepare everything else.",
  },
  {
    q: "Who is eligible to apply for a Somalia eVisa?",
    a: "International visitors travelling to Somalia for tourism, business, family visits, or transit are eligible to apply. Applicants must hold a passport with at least 6 months remaining validity. A local sponsor or host contact in Somalia is typically required for standard applications.",
  },
  {
    q: "Can Somali diaspora (Qurba-Joog) use this service?",
    a: "Yes — our Express service is designed specifically for the Somali diaspora holding a foreign passport. You apply in under 60 seconds by uploading your passport, photo and ticket. Our specialists handle the entire form preparation and submission on your behalf.",
  },
  {
    q: "Is this an official government website?",
    a: "No. eVisa Somalia is an independent specialist service that assists travellers with preparing and submitting their eVisa applications. We are not affiliated with the Somali government. Applications are submitted to the official immigration authority on your behalf.",
  },
  {
    q: "How will I receive my Somalia eVisa?",
    a: "Once your eVisa is approved, you will receive it directly to your email address and via WhatsApp. We also send a concise travel-ready summary so you know exactly what to present at the airport.",
  },
  {
    q: "Can I track my Somalia eVisa application status?",
    a: "Yes. Visit the Status page on this website and enter your application reference number. You will see real-time updates at every stage — from submission through to approval.",
  },
  {
    q: "What happens if my application is denied?",
    a: "Our team will contact you to explain the reason for refusal and guide you through corrections or next steps. In many cases, applications can be resubmitted with additional information.",
  },
  {
    q: "Is my personal data secure?",
    a: "Absolutely. All data is transmitted using bank-grade TLS encryption and stored securely. We never share your personal information with any third party beyond the official immigration authority processing your visa.",
  },
  {
    q: "Is there a visa on arrival for Somalia?",
    a: "Somalia does offer visa on arrival for some nationalities, however availability and conditions can change. We strongly recommend applying for your eVisa in advance through our service to avoid delays or complications at the border.",
  },
  {
    q: "How long is the Somalia eVisa valid?",
    a: "The Somalia eVisa is issued as a single-entry visa valid for up to 180 days from the date of issue. You must enter Somalia within that validity window.",
  },
];

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
      title="Somalia eVisa FAQ — Costs, Requirements & Processing Time"
      description="Answers to the most common questions about the Somalia eVisa — fees, required documents, processing times, eligibility, diaspora applications, and more."
      canonical="https://www.evisasomali.com/faqs"
      jsonLd={faqJsonLd}
    />
    <section className="container py-20 max-w-3xl">
      <SectionHeading eyebrow="FAQs" title="Frequently asked questions" description="Answers to the questions our applicants ask most often." />
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
