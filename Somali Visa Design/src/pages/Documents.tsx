import { PageSEO } from "@/components/PageSEO";
import { SectionHeading } from "@/components/SectionHeading";
import { FileText, Camera, CreditCard, FileSignature, Calendar } from "lucide-react";
import { SITE } from "@/config/site";
import content from "@site-content";

const d = content.documents;
const docs = d.items.map((item, i) => ({ ...item, icon: [FileText, Camera, Calendar, FileSignature, CreditCard][i] ?? FileText }));

const documentsJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": d.howToName,
  "description": d.howToDescription,
  "step": docs.map((x, i) => ({
    "@type": "HowToStep",
    "position": i + 1,
    "name": x.title,
    "text": x.body,
  })),
  "totalTime": "PT5M",
  "supply": docs.map((x) => ({ "@type": "HowToSupply", "name": x.title })),
};

const Documents = () => (
  <>
    <PageSEO
      title={d.seoTitle}
      description={d.seoDescription}
      canonical={`${SITE.url}/documents`}
      jsonLd={documentsJsonLd}
    />
  <section className="container py-20">
    <SectionHeading as="h1" eyebrow={d.eyebrow} title={d.title} description={d.description} />
    <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {docs.map((doc) => (
        <div key={doc.title} className="bg-card border border-border rounded-sm p-8 shadow-card hover:shadow-elegant transition-smooth">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-navy text-accent">
            <doc.icon className="h-5 w-5" />
          </div>
          <h3 className="mt-6 font-serif text-xl text-primary">{doc.title}</h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{doc.body}</p>
        </div>
      ))}
    </div>
  </section>
  </>
);

export default Documents;
