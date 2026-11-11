import type { VisaCountryInfo } from "@/data/visaCountries";

/**
 * Everything that makes one public site read differently from the others.
 *
 * Each site (src/sites/<domain>.ts) supplies its own copy so the three domains don't
 * publish the same text — search engines treat copied pages as duplicates and rank
 * only one of them. Only the site being built is bundled (vite alias @site-content).
 */

export interface Item {
  title: string;
  body: string;
}

export interface QA {
  q: string;
  a: string;
}

export interface OptionCard {
  kicker?: string;
  title: string;
  somali: string;
  body: string;
  bullets: string[];
  button: string;
}

export type HomeSection = "pricing" | "how" | "why" | "services" | "cta";

export interface SiteContent {
  /** Wordmark in the header and footer. */
  logo: { title: string; tagline: string };

  home: {
    seoTitle: string;
    seoDescription: string;
    /** Schema.org Service description. */
    serviceDescription: string;
    heroImageAlt: string;
    heroBadge: string;
    /** Rendered as before + <span>{highlight}</span> + after. */
    heroTitle: { before: string; highlight: string; after: string };
    heroSomali: string;
    heroSub: string;
    heroSubSomali: string;
    heroAlign: "center" | "left";
    /** The three application cards (Standard, Express, guided Ajnabi form). */
    cards: Record<"standard" | "express" | "ajnabi", OptionCard>;
    /** Order of the marketing sections below the application cards. */
    sections: HomeSection[];
    pricing: {
      eyebrow: string;
      title: string;
      description: string;
      standardBody: (time: string) => string;
      expressBody: (time: string) => string;
      ajnabiNote: (fee: string, time: string) => string;
    };
    how: { eyebrow: string; title: string; description: string; steps: Item[] };
    why: {
      eyebrow: string;
      title: string;
      description: string;
      points: string[];
      stat: string;
      statLabel: string;
      imageAlt: string;
    };
    services: { eyebrow: string; title: string; description: string; items: Item[] };
    cta: { title: string; somali: string; body: string; button: string };
  };

  about: {
    seoTitle: string;
    seoDescription: string;
    schemaDescription: string;
    heroEyebrow: string;
    heroTitle: string;
    heroBody: string;
    whoEyebrow: string;
    whoTitle: string;
    /** Paragraphs after the legal-entity paragraph. */
    whoParagraphs: string[];
    whatEyebrow: string;
    whatTitle: string;
    whatSteps: Item[];
    eligibilityEyebrow: string;
    eligibilityTitle: string;
    eligibility: string[];
    valuesEyebrow: string;
    valuesTitle: string;
    values: { label: string; body: string }[];
    ctaTitle: string;
    ctaBody: string;
  };

  faqs: {
    seoTitle: string;
    seoDescription: string;
    eyebrow: string;
    title: string;
    description: string;
    items: QA[];
  };

  /** /documents — five items in order: passport, photo, travel date, sponsor, payment. */
  documents: {
    seoTitle: string;
    seoDescription: string;
    howToName: string;
    howToDescription: string;
    eyebrow: string;
    title: string;
    description: string;
    items: Item[];
  };

  /** /visa — the nationality index. */
  visaIndex: {
    seoTitle: string;
    seoDescription: (count: number) => string;
    eyebrow: string;
    h1: string;
    intro: string;
    note: string;
    listName: string;
    /** Link text for each country. */
    label: (country: string) => string;
    sublabel: (demonym: string) => string;
  };

  country: (d: VisaCountryInfo) => CountryCopy;
}

export interface CountryCopy {
  seoTitle: string;
  seoDescription: string;
  h1: string;
  intro: string;
  cta: string;
  detailsEyebrow: string;
  detailsTitle: string;
  details: Item[];
  requirementsEyebrow: string;
  requirementsTitle: string;
  requirements: string[];
  highlightEyebrow: string;
  highlightTitle: string;
  highlight: string;
  faqTitle: string;
  faqs: QA[];
  relatedTitle: string;
  relatedLabel: (country: string) => string;
  breadcrumb: string;
  ctaTitle: string;
  ctaBody: string;
}
