// eVisaSomali.com — the original site. This copy is what the site has always published;
// keep it as is so the established pages and rankings don't change.
import { SITE } from "@/config/site";
import { AJNABI_OPTION, PRICING_TIERS, formatCheckoutTotal } from "@/lib/pricing";
import type { SiteContent } from "./types";

const standardFee = formatCheckoutTotal(PRICING_TIERS.standard.fee, PRICING_TIERS.standard.currency);
const ajnabiFee = formatCheckoutTotal(AJNABI_OPTION.fee, AJNABI_OPTION.currency);

const content: SiteContent = {
  logo: { title: "Somalia eVisa Application", tagline: "Application Service" },

  home: {
    seoTitle: `Apply for Somalia eVisa Online | Fast & Secure | ${SITE.brand}`,
    seoDescription: `Get your Somalia eVisa in 60 seconds. Upload your passport and photo — our specialists handle the rest. From ${standardFee}, with 5-6hr Express available. WhatsApp updates. 24/7 support.`,
    serviceDescription:
      "Apply for your Somalia eVisa online. Upload your passport and photo — our specialists prepare and submit your application in 60 seconds.",
    heroImageAlt: "Somalia eVisa online application — passport and airplane ready for travel",
    heroBadge: "Somalia eVisa Application · Apply Online",
    heroTitle: { before: "Choose your ", highlight: "application", after: " type" },
    heroSomali: "Dooro nooca codsigaaga",
    heroSub: "Three clear options — pick the one that matches you, then continue. ·",
    heroSubSomali: " Saddex ikhtiyaar oo cad — dooro tan kugu habboon.",
    heroAlign: "center",
    cards: {
      standard: {
        kicker: "Diaspora Service · Adeeg Qurba-Joog",
        title: "I am a Foreigner (Qurba-Joog)",
        somali: "Waxaan ahay Qurba-Joog",
        body: `Diaspora travellers holding a foreign passport. Apply in under 60 seconds by uploading your passport and photo, then providing a few essential details. ${standardFee}, ${PRICING_TIERS.standard.processingTime}.`,
        bullets: ["Fast 60-second application", "Simple document upload", "Minimal information required", "Updates via WhatsApp & email"],
        button: "Use Standard",
      },
      express: {
        kicker: "Rush Service · Adeeg Degdeg ah",
        title: "I need it Fast (Express)",
        somali: "Waan degdegsanahay",
        body: `Same simple application as Standard, prioritized for rush processing. ${formatCheckoutTotal(PRICING_TIERS.express.fee, PRICING_TIERS.express.currency)}, ${PRICING_TIERS.express.processingTime}.`,
        bullets: ["Priority rush processing", "5–6 hour turnaround", "Simple document upload", "Updates via WhatsApp & email"],
        button: "Use Express",
      },
      ajnabi: {
        title: "Non Somali Applicants",
        somali: "Waxaan ahay Ajnabi",
        body: `Travellers holding a foreign passport. A local sponsor is required, so you'll complete the official application yourself with our step-by-step guidance. ${ajnabiFee}, ${AJNABI_OPTION.processingTime}.`,
        bullets: ["Sponsor details required", "Guided form", "Same official eVisa"],
        button: "Start Form",
      },
    },
    sections: ["pricing", "how", "why", "services", "cta"],
    pricing: {
      eyebrow: "Pricing",
      title: "Transparent Pricing",
      description: "No hidden fees. Choose the processing speed that suits your travel plans.",
      standardBody: (time) =>
        `${time} processing. All-inclusive — covers specialist application assistance, document review, and submission through the official Somalia eTAS portal.`,
      expressBody: (time) => `${time} processing. Priority rush handling for urgent travel.`,
      ajnabiNote: (fee, time) =>
        `Foreign nationals (Ajnabi) completing the guided sponsor-required application (Option 3) pay ${fee}, ${time} processing. All fees are displayed clearly before payment is completed.`,
    },
    how: {
      eyebrow: "How it works",
      title: "Simple, transparent, professional.",
      description:
        "Whether you fill the form yourself or use our Express service, we make the eVisa journey effortless from start to finish.",
      steps: [
        { title: "Choose & submit", body: "Pick the path that matches you, then submit your details or documents." },
        { title: "We review & process", body: "Our specialists review every document and prepare a complete, accurate application." },
        { title: "eVisa to your inbox", body: "Once approved, your eVisa arrives by email and WhatsApp — ready to travel." },
      ],
    },
    why: {
      eyebrow: "Why choose us",
      title: "A partner you can trust for your eVisa.",
      description:
        "We make your visa effortless — clear instructions, careful review, and a team ready to help when you need it.",
      points: [
        "Personal review by an expert",
        "Step-by-step guidance at every stage",
        "Priority, fast-track processing",
        "Bank-grade security for your data",
      ],
      stat: "10k+",
      statLabel: "Applications assisted",
      imageAlt: "Passport ready for travel",
    },
    services: {
      eyebrow: "Our Services",
      title: "Everything you need, from start to finish.",
      description: "A careful service that lifts the burden of the eVisa application off your shoulders.",
      items: [
        { title: "Document Preparation", body: "We make sure every document meets the requirements." },
        { title: "Step-by-Step Guidance", body: "Clear instructions tailored to your country and travel purpose." },
        { title: "Fast Processing", body: "Priority review designed for urgent travel." },
        { title: "24/7 Support", body: "Talk to a real specialist any time, day or night." },
        { title: "Secure Data", body: "Bank-grade encryption protects every detail you share." },
        { title: "Ready to Travel", body: "Receive your eVisa with a concise travel-ready summary." },
      ],
    },
    cta: {
      title: "Ready for your journey?",
      somali: "Diyaar ma u tahay safarkaaga?",
      body: "Submit your eVisa application today and travel with complete confidence.",
      button: "Apply Now",
    },
  },

  about: {
    seoTitle: `About ${SITE.brand} — Trusted Visa Application Specialists`,
    seoDescription:
      "We are an independent Somalia eVisa service helping diaspora travellers and international visitors apply accurately and with confidence. Specialist-assisted, secure, 24/7.",
    schemaDescription:
      "An independent Somalia eVisa application service helping diaspora travellers and international visitors apply accurately and with confidence.",
    heroEyebrow: "About Us",
    heroTitle: "A trusted partner for your journey.",
    heroBody:
      "We are an independent service helping travellers — especially Somali diaspora applicants — prepare and submit Somalia eVisa applications accurately and with care.",
    whoEyebrow: "Who We Are",
    whoTitle: "Independent specialists, not a government agency.",
    whoParagraphs: [
      "Somalia opened its electronic visa system to make entry simpler for international visitors and returning diaspora. However, navigating the official portal, uploading documents correctly, and ensuring every field is filled accurately can be challenging — especially for first-time applicants or those unfamiliar with online government systems. That is the gap we fill.",
      "Our specialists review every application before submission. We catch errors, missing documents, and formatting issues that commonly cause delays or rejections. The result is a faster, smoother experience for our clients — with WhatsApp updates at every step of the way.",
    ],
    whatEyebrow: "What We Do",
    whatTitle: "From application to approval — we handle it.",
    whatSteps: [
      {
        title: "You upload your documents",
        body: "Submit your passport scan, passport-size photo, and travel details through our secure online form. The entire process takes under five minutes.",
      },
      {
        title: "Our specialists review and submit",
        body: "A trained specialist reviews your application for errors and completeness, then submits it directly to the official Somalia eTAS portal on your behalf.",
      },
      {
        title: "You receive your eVisa",
        body: "Once approved by the Somali authorities, your eVisa is sent directly to your email address. Most approvals are issued within 72 hours of submission.",
      },
    ],
    eligibilityEyebrow: "Eligibility",
    eligibilityTitle: "Who can apply for the Somalia eVisa?",
    eligibility: [
      "International travellers visiting Somalia for tourism, business, or family",
      "Somali diaspora holding foreign passports who wish to visit their country of origin",
      "Holders of a passport valid for at least 6 months from the intended arrival date",
      "Applicants with a clear digital passport-size photo and confirmed travel itinerary",
      "Visitors who need a single-entry visa valid for up to 180 days",
    ],
    valuesEyebrow: "Our Values",
    valuesTitle: "Built on trust and expertise.",
    values: [
      { label: "Trusted", body: "Hundreds of applications processed with a near-perfect approval rate." },
      { label: "Personal", body: "Every application reviewed by a real human specialist, not a bot." },
      { label: "Expert", body: "Deep knowledge of Somalia eTAS requirements and common rejection reasons." },
      { label: "Global", body: "Supporting applicants from over 50 countries across 6 continents." },
    ],
    ctaTitle: "Ready to apply?",
    ctaBody:
      "Start your Somalia eVisa application today. It takes less than five minutes and our team will handle the rest.",
  },

  faqs: {
    seoTitle: "Somalia eVisa FAQ — Costs, Requirements & Processing Time",
    seoDescription:
      "Answers to the most common questions about the Somalia eVisa — fees, required documents, processing times, eligibility, diaspora applications, and more.",
    eyebrow: "FAQs",
    title: "Frequently asked questions",
    description: "Answers to the questions our applicants ask most often.",
    items: [
      {
        q: "How long does a Somalia eVisa application take?",
        a: "It depends on the processing option you choose: Option 1 (Standard, £66) takes 24–72 hours. Option 2 (Express, $150 USD) takes just 5–6 hours during Somalia working hours. Option 3, our guided application for foreign (Ajnabi) applicants, takes 24–72 hours.",
      },
      {
        q: "How much does the Somalia eVisa cost?",
        a: "We offer three processing options: Option 1 Standard (£66, 24–72 hours), Option 2 Express ($150 USD, 5–6 hours), and Option 3 the guided foreigner (Ajnabi) application (£66, 24–72 hours). Each includes the official government eTAS fee, our specialist preparation, submission and document review service, and a £2 payment processing fee (Standard and Ajnabi only), for a single-entry eVisa valid for up to 180 days.",
      },
      {
        q: "What documents do I need for a Somalia eVisa?",
        a: "You will need: (1) a valid passport with at least 6 months validity, (2) a recent passport-style photo, (3) your planned travel date, and (4) basic personal details. Foreign (Ajnabi) applicants also need a sponsor document. Diaspora (Qurba-Joog) applicants using our Standard or Express service simply upload these — our specialists prepare everything else.",
      },
      {
        q: "Who is eligible to apply for a Somalia eVisa?",
        a: "International visitors travelling to Somalia for tourism, business, family visits, or transit are eligible to apply. Applicants must hold a passport with at least 6 months remaining validity. A local sponsor is required for foreign (Ajnabi) applicants.",
      },
      {
        q: "Can Somali diaspora (Qurba-Joog) use this service?",
        a: "Yes — our Standard and Express services are designed specifically for the Somali diaspora holding a foreign passport. You apply in under 60 seconds by uploading your passport and photo. Our specialists handle the entire form preparation and submission on your behalf.",
      },
      {
        q: "Is this an official government website?",
        a: `No. ${SITE.brand} is an independent specialist service that assists travellers with preparing and submitting their eVisa applications. We are not affiliated with the Somali government.`,
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
        a: "Absolutely. All data is transmitted using bank-grade TLS encryption and stored securely. We never sell or share your personal information with third parties.",
      },
      {
        q: "Is there a visa on arrival for Somalia?",
        a: "Somalia does offer visa on arrival for some nationalities, however availability and conditions can change. We strongly recommend applying for your eVisa in advance through our service to avoid delays or complications at the border.",
      },
      {
        q: "How long is the Somalia eVisa valid?",
        a: "The Somalia eVisa is issued as a single-entry visa valid for up to 180 days from the date of issue. You must enter Somalia within that validity window.",
      },
    ],
  },

  documents: {
    seoTitle: `Somalia eVisa Requirements — Documents You Need | ${SITE.brand}`,
    seoDescription:
      "Find out exactly what documents you need for a Somalia eVisa: valid passport, digital photo, travel date and (for foreign applicants) a sponsor document. Apply online in minutes.",
    howToName: "How to Apply for a Somalia eVisa",
    howToDescription: "Documents required to apply for a Somalia eVisa online. Have these ready before starting your application.",
    eyebrow: "Required Documents",
    title: "What you need to apply.",
    description: "Have these ready before you start so we can review your application quickly.",
    items: [
      { title: "Valid Passport", body: "Valid for at least 6 months from your arrival date, with two blank pages." },
      { title: "Digital Photo", body: "A recent passport-style photo on a clear background, taken within the last 6 months." },
      { title: "Travel Date", body: "Your planned arrival date in Somalia (Taariikhda Safarka)." },
      { title: "Sponsor Document", body: "Required for foreign (Ajnabi) applicants only — a sponsor letter or invitation document from your local contact." },
      { title: "Payment Method", body: `A credit or debit card to complete the processing fee — from ${standardFee}.` },
    ],
  },

  visaIndex: {
    seoTitle: `Somalia Visa by Nationality — Requirements by Country | ${SITE.brand}`,
    seoDescription: (count) =>
      `Somalia eVisa requirements for all ${count} nationalities. Find the documents, processing time and fees for your passport — from the United States, United Kingdom, Sweden, Kenya and more.`,
    eyebrow: "Visas by Nationality",
    h1: "Somalia eVisa requirements by nationality",
    intro: "Choose your passport country for the documents, processing time and fees that apply to your Somalia eVisa.",
    note: "All foreign nationals need an approved eVisa (eTAS) before travelling to Somalia. Somali-born travellers holding a foreign passport (Qurba-Joog diaspora) also apply online through the same process. Select your nationality below for country-specific guidance.",
    listName: "Somalia visa requirements by nationality",
    label: (country) => `Somalia Visa for ${country}`,
    sublabel: (demonym) => `${demonym} passport holders`,
  },

  country: (d) => ({
    seoTitle: `Somalia eVisa for ${d.demonym} Citizens | ${SITE.brand}`,
    seoDescription: `Apply for your Somalia eVisa from ${d.country}. ${d.intro}`,
    h1: `Somalia eVisa for ${d.demonym} Citizens`,
    intro: d.intro,
    cta: `Start your application — ${ajnabiFee}`,
    detailsEyebrow: "Key Details",
    detailsTitle: `What ${d.demonym} travellers need to know`,
    details: [
      {
        title: "Processing Time",
        body: `Most applications are reviewed and submitted within ${AJNABI_OPTION.processingTime} of receiving your complete documents. Express (5-6hr) processing is also available.`,
      },
      {
        title: "Visa Fee",
        body: `${ajnabiFee}, all-inclusive — covers the official government eTAS fee and our specialist service. No hidden charges.`,
      },
      { title: "Validity", body: "Single or multiple-entry options available, valid for up to 180 days from the date of issue." },
    ],
    requirementsEyebrow: "Requirements",
    requirementsTitle: `Documents ${d.demonym} citizens need`,
    requirements: [
      "A valid passport with at least 6 months' validity remaining from your travel date",
      "A recent passport-style photo on a plain, light-coloured background",
      "A clear scanned copy of your passport's bio-data page",
      "Your planned travel (arrival) date",
      "A sponsor document, if applying as a foreign (Ajnabi) national",
      "A valid email address to receive your approved eVisa",
    ],
    highlightEyebrow: d.country,
    highlightTitle: "Helping you travel with confidence",
    highlight: d.highlight,
    faqTitle: `${d.country} — Frequently Asked Questions`,
    faqs: [
      {
        q: `Do ${d.demonym} citizens need a visa for Somalia?`,
        a: `Yes. ${d.demonym} passport holders must obtain an approved eVisa before travelling to Somalia. ${SITE.brand} helps you prepare and submit this application online.`,
      },
      {
        q: "How long does processing take?",
        a: `Most applications are reviewed by our specialists and submitted to the official Somalia eTAS portal within ${AJNABI_OPTION.processingTime} of receiving your complete documents. A 5-6 hour Express option is also available for urgent travel.`,
      },
      {
        q: `What does the ${ajnabiFee} fee cover?`,
        a: `The ${ajnabiFee} fee is all-inclusive: it covers the official government eTAS fee as well as our specialist review, document checks, and submission service. No hidden charges.`,
      },
      {
        q: `Can I apply from ${d.country}?`,
        a: `Yes. The application is completed entirely online, so you can apply from anywhere in ${d.country} (or abroad), regardless of your departure location.`,
      },
    ],
    relatedTitle: `Somalia visa for other ${d.region} nationalities`,
    relatedLabel: (country) => `Somalia Visa for ${country}`,
    breadcrumb: `Somalia Visa for ${d.country}`,
    ctaTitle: "Ready to apply?",
    ctaBody:
      "Start your Somalia eVisa application today. It takes less than five minutes and our team will handle the rest.",
  }),
};

export default content;
