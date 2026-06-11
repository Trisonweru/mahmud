import { PageSEO } from "@/components/PageSEO";
import { SectionHeading } from "@/components/SectionHeading";
import { FileText, Camera, Plane, CreditCard, MapPin, Calendar } from "lucide-react";

const docs = [
  { icon: FileText, title: "Valid Passport", body: "Valid for at least 6 months from your arrival date, with two blank pages." },
  { icon: Camera, title: "Digital Photo", body: "A recent passport-style photo on a clear background, taken within the last 6 months." },
  { icon: Plane, title: "Flight Ticket", body: "A confirmed return or onward ticket showing your travel dates." },
  { icon: MapPin, title: "Proof of Accommodation", body: "Hotel reservation or invitation letter from your host in your destination country." },
  { icon: Calendar, title: "Travel Dates", body: "Clear arrival and departure dates that match your itinerary." },
  { icon: CreditCard, title: "Payment Method", body: "A credit or debit card to complete the $94 processing fee." },
];

const documentsJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Apply for a Somalia eVisa",
  "description": "Documents required to apply for a Somalia eVisa online. Have these ready before starting your application.",
  "step": docs.map((d, i) => ({
    "@type": "HowToStep",
    "position": i + 1,
    "name": d.title,
    "text": d.body,
  })),
  "totalTime": "PT5M",
  "supply": docs.map((d) => ({ "@type": "HowToSupply", "name": d.title })),
};

const Documents = () => (
  <>
    <PageSEO
      title="Somalia eVisa Requirements — Documents You Need | eVisaSomali"
      description="Find out exactly what documents you need for a Somalia eVisa: valid passport, digital photo, flight ticket, accommodation proof and travel dates. Apply online in minutes."
      canonical="https://www.evisasomali.com/documents"
      jsonLd={documentsJsonLd}
    />
  <section className="container py-20">
    <SectionHeading eyebrow="Required Documents" title="What you need to apply." description="Have these ready before you start so we can review your application quickly." />
    <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {docs.map((d) => (
        <div key={d.title} className="bg-card border border-border rounded-sm p-8 shadow-card hover:shadow-elegant transition-smooth">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-navy text-accent">
            <d.icon className="h-5 w-5" />
          </div>
          <h3 className="mt-6 font-serif text-xl text-primary">{d.title}</h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{d.body}</p>
        </div>
      ))}
    </div>
  </section>
  </>
);

export default Documents;
