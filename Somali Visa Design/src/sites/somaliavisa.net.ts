// Somaliavisa.net — short, fast, mobile-first copy aimed at diaspora travellers and
// last-minute trips. Deliberately different wording from the other two sites.
import { SITE } from "@/config/site";
import { AJNABI_OPTION, PRICING_TIERS, formatCheckoutTotal } from "@/lib/pricing";
import type { VisaCountryInfo, VisaRegion } from "@/data/visaCountries";
import type { SiteContent } from "./types";

const standardFee = formatCheckoutTotal(PRICING_TIERS.standard.fee, PRICING_TIERS.standard.currency);
const expressFee = formatCheckoutTotal(PRICING_TIERS.express.fee, PRICING_TIERS.express.currency);
const ajnabiFee = formatCheckoutTotal(AJNABI_OPTION.fee, AJNABI_OPTION.currency);

const pick = <T,>(slug: string, options: T[]): T => {
  let h = 7;
  for (const ch of slug) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return options[h % options.length];
};

const regionLine: Record<VisaRegion, string> = {
  Africa: "neighbouring and regional travellers",
  Europe: "the large Somali communities across Europe",
  "Middle East": "travellers and workers based in the Gulf",
  Asia: "business and family travellers from Asia",
  "North America": "Somali-American and Somali-Canadian families",
  "Central America & Caribbean": "visitors from the Caribbean and Central America",
  "South America": "visitors from South America",
  Oceania: "the Somali community in Australia and New Zealand",
};

const country = (d: VisaCountryInfo) => {
  const intro = pick(d.slug, [
    `Yes — ${d.demonym} passport holders need a Somalia visa, and it is issued online. Send us your passport and a photo from ${d.country} and we handle the rest, usually within ${AJNABI_OPTION.processingTime}.`,
    `Flying to Somalia from ${d.country}? Get your Somalia visa online before you travel. Upload your passport and photo in about a minute; our team checks it and submits it for you.`,
    `A Somalia visa for ${d.demonym} citizens takes minutes to request online. Choose Standard or Express, upload your documents, and track everything on WhatsApp.`,
  ]);
  const highlight = pick(d.slug + "x", [
    `We regularly help ${regionLine[d.region]}, including first-time visitors and families going home for weddings, Eid and holidays.`,
    `From short family visits to work trips, we process Somalia visas for ${regionLine[d.region]} every week — with Express for urgent travel.`,
    `Our team speaks English and Somali and supports ${regionLine[d.region]} on WhatsApp, day and night.`,
  ]);
  return {
    seoTitle: `Somalia Visa for ${d.country}: Apply Online in Minutes`,
    seoDescription: `${d.demonym} citizens need a Somalia visa. Apply online from ${d.country}: upload your passport and photo, pay ${standardFee}, and get updates on WhatsApp.`,
    h1: `Somalia Visa for ${d.country}`,
    intro,
    cta: `Get my Somalia visa — ${ajnabiFee}`,
    detailsEyebrow: "Quick facts",
    detailsTitle: `Somalia visa from ${d.country} in brief`,
    details: [
      { title: "Speed", body: `Standard: ${AJNABI_OPTION.processingTime}. Express: about 5–6 hours on Somali working days (${expressFee}).` },
      { title: "Price", body: `${ajnabiFee} all in — government fee and our service together. No extra charges at checkout.` },
      { title: "Stay", body: "Valid for up to 180 days from the date it's issued." },
    ],
    requirementsEyebrow: "What to send",
    requirementsTitle: "What you'll need",
    requirements: [
      "Passport with 6+ months left from your arrival date",
      "Photo of the passport's details page",
      "A recent selfie-style photo on a plain background",
      "Your arrival date in Somalia",
      "Sponsor information (non-Somali visitors only)",
      "Email and WhatsApp number for updates",
    ],
    highlightEyebrow: d.region,
    highlightTitle: `Trusted by travellers from ${d.country}`,
    highlight,
    faqTitle: `Somalia visa for ${d.demonym} citizens: FAQs`,
    faqs: [
      {
        q: `Can ${d.demonym} citizens get a Somalia visa online?`,
        a: `Yes. The Somalia visa is issued electronically, so ${d.demonym} citizens apply online and receive it by email. We prepare and submit it for you.`,
      },
      {
        q: "What's the fastest option?",
        a: `Express (${expressFee}) — usually about 5–6 hours during Somali working hours. Standard takes ${AJNABI_OPTION.processingTime}.`,
      },
      {
        q: `Is ${ajnabiFee} the final price?`,
        a: "Yes. It includes the government fee and our checking and submission service.",
      },
      {
        q: "Can I apply on my phone?",
        a: `Yes. Take a photo of your passport and yourself, upload them, and you're done — from ${d.country} or anywhere else.`,
      },
    ],
    relatedTitle: `Somalia visa: more ${d.region} countries`,
    relatedLabel: (c: string) => `${c}`,
    breadcrumb: `Somalia visa for ${d.country}`,
    ctaTitle: "Get your Somalia visa today",
    ctaBody: "Upload your passport and photo now. We'll message you on WhatsApp as soon as it's approved.",
  };
};

const content: SiteContent = {
  logo: { title: "SomaliaVisa", tagline: "Online Visa Service" },

  home: {
    seoTitle: `Somalia Visa Online — Apply in Minutes | ${SITE.brand}`,
    seoDescription: `Get your Somalia visa online. Upload your passport and photo from your phone, pay ${standardFee} (Express ${expressFee}) and get WhatsApp updates until it's approved.`,
    serviceDescription:
      "Online Somalia visa service: upload a passport and photo, choose Standard or Express processing and receive the approved visa by email.",
    heroImageAlt: "Somalia visa approved online — ready to fly",
    heroBadge: "Somalia visa · Online in minutes",
    heroTitle: { before: "Get your ", highlight: "Somalia visa", after: " online" },
    heroSomali: "Fiisahaaga Soomaaliya — online",
    heroSub: "Standard, Express or guided — choose one and you're nearly done. ·",
    heroSubSomali: " Dooro mid, waan kuu dhammaynaynaa.",
    heroAlign: "center",
    cards: {
      standard: {
        kicker: "Diaspora · Qurba-Joog",
        title: "Somali, foreign passport",
        somali: "Qurba-Joog",
        body: `Upload passport + photo, add a few details — done. ${standardFee}, ${PRICING_TIERS.standard.processingTime}.`,
        bullets: ["About a minute to apply", "Works on your phone", "No long forms", "WhatsApp + email updates"],
        button: "Go Standard",
      },
      express: {
        kicker: "Urgent · Degdeg",
        title: "I need it today",
        somali: "Maanta ayaan u baahanahay",
        body: `Same quick application, top priority. ${expressFee}, about 5–6 hours on Somali working days.`,
        bullets: ["Top-priority handling", "About 5–6 hours", "Works on your phone", "WhatsApp + email updates"],
        button: "Go Express",
      },
      ajnabi: {
        title: "Not Somali?",
        somali: "Ajnabi",
        body: `Visitors with a local sponsor. Fill in our guided form step by step. ${ajnabiFee}, ${AJNABI_OPTION.processingTime}.`,
        bullets: ["Sponsor required", "Guided step by step", "Official Somalia eVisa"],
        button: "Start",
      },
    },
    sections: ["why", "pricing", "services", "how", "cta"],
    pricing: {
      eyebrow: "Prices",
      title: "Simple prices",
      description: "Government fee included. What you see is what you pay.",
      standardBody: (time) => `${time}. Checked, completed and submitted for you.`,
      expressBody: () => "About 5–6 hours on Somali working days. For flights that can't wait.",
      ajnabiNote: (fee, time) =>
        `Non-Somali visitors with a sponsor: guided application (Option 3), ${fee}, ${time}.`,
    },
    how: {
      eyebrow: "Steps",
      title: "Done in three steps.",
      description: "No account, no long forms — just your documents.",
      steps: [
        { title: "Upload", body: "Passport and photo, straight from your phone." },
        { title: "We submit", body: "Our team checks it and sends it to the Somali eTAS." },
        { title: "Fly", body: "Your visa lands in your inbox, with a WhatsApp alert." },
      ],
    },
    why: {
      eyebrow: "Why SomaliaVisa",
      title: "Built for people going home.",
      description: "Many of our customers are Somali families abroad. We keep it quick, clear and in your language.",
      points: [
        "Apply in about a minute",
        "Updates on WhatsApp, in English or Somali",
        "Express in about 5–6 hours",
        "Secure, encrypted uploads",
      ],
      stat: "5–6h",
      statLabel: "Express turnaround",
      imageAlt: "Passport with a Somalia visa approval",
    },
    services: {
      eyebrow: "Included",
      title: "What we do for you",
      description: "One price covers all of it.",
      items: [
        { title: "Document check", body: "We make sure your passport and photo will be accepted." },
        { title: "Form filled for you", body: "No need to learn the government portal." },
        { title: "Express lane", body: "Priority handling for urgent trips." },
        { title: "WhatsApp support", body: "Message us any time — real people reply." },
        { title: "Privacy", body: "Your documents are encrypted and never shared." },
        { title: "Visa by email", body: "Approved visa sent straight to you." },
      ],
    },
    cta: {
      title: "Going to Somalia soon?",
      somali: "Safar Soomaaliya ma leedahay?",
      body: "Apply now — it only takes a minute.",
      button: "Apply now",
    },
  },

  about: {
    seoTitle: `About ${SITE.brand} — Online Somalia Visa Service`,
    seoDescription:
      "SomaliaVisa.net helps Somali diaspora families and visitors get a Somalia visa online quickly, with WhatsApp support in English and Somali.",
    schemaDescription:
      "Online Somalia visa service for diaspora families and visitors, with document checks, submission and WhatsApp support.",
    heroEyebrow: "About",
    heroTitle: "Somalia visas, without the hassle.",
    heroBody:
      "We built SomaliaVisa.net for families flying home and visitors who just want their visa sorted quickly — on their phone, in their language.",
    whoEyebrow: "Our story",
    whoTitle: "A small team that knows the process inside out.",
    whoParagraphs: [
      "Applying through the government eTAS on your own means learning a new portal, getting the scans exactly right and waiting to find out whether anything was wrong. We take that work off your hands.",
      "You send your passport and photo; we check them, complete the form, submit it and message you on WhatsApp when the visa is approved.",
    ],
    whatEyebrow: "How it works",
    whatTitle: "Upload, we submit, you fly.",
    whatSteps: [
      { title: "Upload", body: "Passport and photo from your phone or computer — about a minute." },
      { title: "We submit", body: "Our team checks everything and submits it to the official Somalia eTAS." },
      { title: "You fly", body: "The approved visa arrives by email. Most are issued within 72 hours." },
    ],
    eligibilityEyebrow: "Who can apply",
    eligibilityTitle: "Is the Somalia visa for me?",
    eligibility: [
      "Somali diaspora with a foreign passport",
      "Tourists, business visitors and family visitors",
      "Passports with 6+ months remaining",
      "Stays of up to 180 days",
      "Non-Somali visitors with a local sponsor",
    ],
    valuesEyebrow: "Why us",
    valuesTitle: "Fast, friendly, secure.",
    values: [
      { label: "Fast", body: "Express visas in about 5–6 hours on working days." },
      { label: "Friendly", body: "Support in English and Somali on WhatsApp." },
      { label: "Secure", body: "Encrypted uploads and secure card payments." },
      { label: "Checked", body: "A real person checks every application." },
    ],
    ctaTitle: "Get your visa sorted.",
    ctaBody: "Upload your passport and photo now — we'll handle the rest.",
  },

  faqs: {
    seoTitle: "Somalia Visa FAQ — Price, Speed & What You Need",
    seoDescription:
      "Quick answers about the Somalia visa: price, Express timing, documents, diaspora applications, sponsors and how to track your visa.",
    eyebrow: "FAQ",
    title: "Somalia visa FAQ",
    description: "Everything people ask us before they apply.",
    items: [
      {
        q: "How much is a Somalia visa?",
        a: `${standardFee} for Standard, ${expressFee} for Express, and ${ajnabiFee} for the guided non-Somali (Ajnabi) application. Government fee included.`,
      },
      {
        q: "How fast can I get it?",
        a: `Express: about 5–6 hours on Somali working days. Standard and Ajnabi: ${PRICING_TIERS.standard.processingTime}.`,
      },
      {
        q: "What do I need?",
        a: "A passport with at least 6 months left, a photo of yourself on a plain background, your arrival date and an email address. Non-Somali visitors also need a sponsor.",
      },
      {
        q: "I'm Somali with a British/US/European passport — which option?",
        a: "Standard or Express. Upload your passport and photo and we do everything else.",
      },
      {
        q: "Can I apply from my phone?",
        a: "Yes. The whole application works on mobile, including the uploads.",
      },
      {
        q: "Will I get updates?",
        a: "Yes — by email and WhatsApp, and you can check the Status page any time with your reference.",
      },
      {
        q: "Is this the government website?",
        a: `No. ${SITE.brand} is an independent service that prepares and submits your application. The Somali authorities make the decision.`,
      },
      {
        q: "What if I'm refused?",
        a: "We'll explain why and help you fix and resubmit where possible.",
      },
      {
        q: "How long is the visa valid?",
        a: "Up to 180 days from the date of issue.",
      },
      {
        q: "Can I get a visa on arrival instead?",
        a: "Some nationalities can, but the rules change. Applying in advance avoids problems at check-in and at the airport.",
      },
    ],
  },

  documents: {
    seoTitle: `What You Need for a Somalia Visa | ${SITE.brand}`,
    seoDescription:
      "Somalia visa documents: passport (6+ months), a photo, your arrival date, a sponsor for non-Somali visitors, and a card to pay. Apply on your phone.",
    howToName: "Somalia visa: what you need",
    howToDescription: "The documents needed to apply for a Somalia visa online.",
    eyebrow: "Documents",
    title: "What you need.",
    description: "Five things. Most people already have them on their phone.",
    items: [
      { title: "Passport", body: "Valid 6+ months after arrival. A clear photo of the details page is fine." },
      { title: "Photo", body: "Recent, plain background, face clearly visible." },
      { title: "Arrival date", body: "When you plan to land in Somalia." },
      { title: "Sponsor", body: "Non-Somali visitors only: a letter or invitation from your sponsor in Somalia." },
      { title: "Card", body: `Debit or credit card. From ${standardFee}.` },
    ],
  },

  visaIndex: {
    seoTitle: `Somalia Visa by Country — ${SITE.brand}`,
    seoDescription: (count) =>
      `Somalia visa for ${count} countries. Find yours, see the price and speed, and apply online in minutes with WhatsApp updates.`,
    eyebrow: "Countries",
    h1: "Somalia visa: choose your country",
    intro: "Price, speed and what to upload — for every passport.",
    note: "Every foreign passport needs a Somalia visa before travel, including Somali diaspora with a British, American, European or other passport. Tap your country to start.",
    listName: "Somalia visa by country",
    label: (country) => `${country}`,
    sublabel: (demonym) => `Somalia visa · ${demonym} passport`,
  },

  country,
};

export default content;
