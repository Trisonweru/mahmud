// EvisaSomalia.com — written as a plain-English guide to the Somalia eTAS:
// checklists, "how it works" first, practical travel notes. Deliberately different
// wording from eVisaSomali.com and Somaliavisa.net so each site stands on its own.
import { SITE } from "@/config/site";
import { AJNABI_OPTION, PRICING_TIERS, formatCheckoutTotal } from "@/lib/pricing";
import type { VisaCountryInfo, VisaRegion } from "@/data/visaCountries";
import type { SiteContent } from "./types";

const standardFee = formatCheckoutTotal(PRICING_TIERS.standard.fee, PRICING_TIERS.standard.currency);
const expressFee = formatCheckoutTotal(PRICING_TIERS.express.fee, PRICING_TIERS.express.currency);
const ajnabiFee = formatCheckoutTotal(AJNABI_OPTION.fee, AJNABI_OPTION.currency);

/** Stable small number per country, so each country page gets a consistent variant. */
const pick = <T,>(slug: string, options: T[]): T => {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return options[h % options.length];
};

const regionNote: Record<VisaRegion, string> = {
  Africa:
    "Many travellers from across Africa fly to Mogadishu via Nairobi, Addis Ababa or Istanbul, and the eVisa must be approved before you board the first leg.",
  Europe:
    "Most European departures connect through Istanbul, Dubai or Addis Ababa, and airlines check for an approved eVisa at check-in before the connecting flight.",
  "Middle East":
    "Direct and one-stop routes from the Gulf are common, so it pays to have the approved eVisa printed or saved on your phone before you reach the airport.",
  Asia:
    "Routes from Asia usually connect through the Gulf or Addis Ababa; leave enough time for approval before your first flight departs.",
  "North America":
    "Flights from North America typically route through Istanbul, Doha or Dubai, so plan the application around your outbound date rather than your arrival.",
  "Central America & Caribbean":
    "Journeys from the region usually involve two connections, so we recommend applying as soon as your outbound flight is booked.",
  "South America":
    "Routes from South America generally connect in Europe or the Gulf; apply early so the eVisa is ready before your long-haul departure.",
  Oceania:
    "From Oceania the trip usually connects in the Gulf, so it is worth applying a little earlier than you think you need to.",
};

const country = (d: VisaCountryInfo) => {
  const intro = pick(d.slug, [
    `Planning a trip to Somalia on a ${d.demonym} passport? You need an approved Somalia eVisa (issued through the eTAS system) before you travel. This guide explains what to prepare, what it costs and how ${SITE.brand} can handle it for you.`,
    `${d.demonym} citizens cannot board a flight to Somalia without an approved eVisa. Here is a clear checklist for applicants in ${d.country}, plus the simplest way to get your application checked and processed.`,
    `Travelling from ${d.country} to Somalia? The entry permit is an electronic visa issued online through the Somalia eTAS. Below we cover the documents, fees and timings that apply to ${d.demonym} passport holders.`,
    `If you hold a ${d.demonym} passport, Somalia requires you to obtain an eVisa in advance. We walk you through each requirement and can handle the whole application for you from ${d.country}.`,
  ]);
  const highlight = pick(d.slug + "h", [
    `${regionNote[d.region]} Our team double-checks your passport scan, photo and travel date so the application isn't sent back for corrections.`,
    `Whether you are visiting family, working on a project or travelling for leisure, the process for ${d.demonym} applicants is the same. ${regionNote[d.region]}`,
    `${regionNote[d.region]} If you are of Somali heritage travelling on a ${d.demonym} passport, our quick diaspora application needs only your passport and a photo.`,
  ]);
  return {
    seoTitle: `Somalia eVisa Guide for ${d.demonym} Passport Holders`,
    seoDescription: `Do ${d.demonym} citizens need a visa for Somalia? Yes. See the eTAS requirements, fees and processing times for applicants in ${d.country}, and apply online.`,
    h1: `Somalia eVisa Guide for ${d.demonym} Passport Holders`,
    intro,
    cta: `Apply from ${d.country} — ${ajnabiFee}`,
    detailsEyebrow: "At a glance",
    detailsTitle: `The essentials for ${d.country}`,
    details: [
      {
        title: "How long it takes",
        body: `Allow ${AJNABI_OPTION.processingTime} once your documents are complete. In a hurry? Express handling returns a decision in about 5–6 hours on Somali working days.`,
      },
      {
        title: "What you pay",
        body: `${ajnabiFee} in total. That single price covers everything, with nothing added later.`,
      },
      {
        title: "How long it lasts",
        body: "The eVisa is valid for up to 180 days from issue — enter Somalia within that window.",
      },
    ],
    requirementsEyebrow: "Checklist",
    requirementsTitle: `Your ${d.demonym} application checklist`,
    requirements: [
      `Your ${d.demonym} passport, valid for six months or more beyond your arrival date`,
      "A clear photo or scan of the passport's photo page (all four corners visible)",
      "A recent head-and-shoulders photo against a plain, pale background",
      "The date you plan to arrive in Somalia",
      "Sponsor details, if you are applying as a non-Somali (Ajnabi) visitor",
      "An email address you check regularly — the approved eVisa is sent there",
    ],
    highlightEyebrow: `Travelling from ${d.country}`,
    highlightTitle: "Good to know before you fly",
    highlight,
    faqTitle: `Questions from ${d.demonym} travellers`,
    faqs: [
      {
        q: `Is a visa required for ${d.demonym} citizens visiting Somalia?`,
        a: `It is. Every ${d.demonym} passport holder needs an approved Somalia eVisa before departure, whatever the purpose of the trip. ${SITE.brand} can arrange it for you online.`,
      },
      {
        q: `How quickly can I get a Somalia eVisa from ${d.country}?`,
        a: `Standard applications take ${AJNABI_OPTION.processingTime} after we receive complete documents. For last-minute trips, Express handling (${expressFee}) aims for about 5–6 hours during Somali working hours.`,
      },
      {
        q: "Are there any extra charges on top of the price shown?",
        a: `No. The ${ajnabiFee} you see covers everything, including our document checks and processing — nothing is added later.`,
      },
      {
        q: `Do I have to be in ${d.country} to apply?`,
        a: "No. Everything is done online, so you can apply from home, from work or while already travelling — as long as the eVisa is approved before you fly to Somalia.",
      },
    ],
    relatedTitle: `Guides for other ${d.region} passports`,
    relatedLabel: (c: string) => `${c} passport guide`,
    breadcrumb: `Somalia eVisa guide: ${d.country}`,
    ctaTitle: "Start your checklist now",
    ctaBody: "Have your passport and a photo ready and the online form takes a few minutes. We review everything before it is sent.",
  };
};

const content: SiteContent = {
  logo: { title: "EvisaSomalia", tagline: "Somalia eTAS Guide" },

  home: {
    seoTitle: `Somalia eVisa Online: Requirements & Application | ${SITE.brand}`,
    seoDescription: `A clear guide to the Somalia eVisa (eTAS) with every application checked by specialists. From ${standardFee}, Express in about 5–6 hours.`,
    serviceDescription:
      "Guided Somalia eVisa (eTAS) application service: requirements explained, documents checked by specialists and the application handled for you.",
    heroImageAlt: "Traveller preparing a Somalia eVisa application before a flight",
    heroBadge: "Somalia eTAS · Guided online application",
    heroTitle: { before: "Your Somalia eVisa, ", highlight: "explained", after: " and done for you" },
    heroSomali: "Fiisaha Soomaaliya — si fudud",
    heroSub: "Pick the route that fits your passport and timeline. We check every document before your application is processed. ·",
    heroSubSomali: " Dooro habka kugu habboon.",
    heroAlign: "left",
    cards: {
      standard: {
        kicker: "Somali heritage · Qurba-Joog",
        title: "Somali diaspora, foreign passport",
        somali: "Qurba-Joog baan ahay",
        body: `For travellers of Somali origin on a non-Somali passport. Upload your passport and a photo, confirm a few details and we prepare the rest. ${standardFee} · ${PRICING_TIERS.standard.processingTime}.`,
        bullets: ["Takes about a minute", "Passport and photo upload", "No long forms to fill in", "Progress by WhatsApp and email"],
        button: "Choose Standard",
      },
      express: {
        kicker: "Short notice · Degdeg",
        title: "Flying in the next day or two",
        somali: "Safarkaygu waa dhow yahay",
        body: `The same quick diaspora application, moved to the front of the queue. ${expressFee} · about 5–6 hours on Somali working days.`,
        bullets: ["Front-of-queue handling", "Decision in about 5–6 hours", "Passport and photo upload", "Progress by WhatsApp and email"],
        button: "Choose Express",
      },
      ajnabi: {
        title: "Visitors without Somali heritage",
        somali: "Ajnabi baan ahay",
        body: `For all other foreign visitors. You will need a local sponsor in Somalia, and our guided form walks you through every question. ${ajnabiFee} · ${AJNABI_OPTION.processingTime}.`,
        bullets: ["Local sponsor needed", "Step-by-step guided form", "Official Somalia eVisa"],
        button: "Open guided form",
      },
    },
    sections: ["how", "services", "pricing", "why", "cta"],
    pricing: {
      eyebrow: "Fees",
      title: "One price, no surprises",
      description: "Each price below is all-inclusive. You see the total before you pay.",
      standardBody: (time) =>
        `Decision usually within ${time}. Includes our document check, form preparation and processing.`,
      expressBody: () => "Moved to the front of the queue — typically about 5–6 hours on Somali working days.",
      ajnabiNote: (fee, time) =>
        `Non-Somali (Ajnabi) visitors who need a sponsor use the guided application (Option 3): ${fee}, around ${time}. The full amount is shown before checkout.`,
    },
    how: {
      eyebrow: "The process",
      title: "Three steps from passport to approval.",
      description: "The Somalia eTAS can be confusing the first time. Here is exactly what happens after you start.",
      steps: [
        { title: "1. Tell us about your trip", body: "Choose your route, add your travel date and upload a passport scan and photo." },
        { title: "2. We check and process", body: "A specialist reads every field, fixes common mistakes and processes your application." },
        { title: "3. Receive the approval", body: "Your eVisa is emailed to you and you get a WhatsApp message as soon as it is issued." },
      ],
    },
    why: {
      eyebrow: "Why travellers use us",
      title: "Fewer rejected applications, less stress.",
      description:
        "Most refusals come from small errors — a cropped scan, a wrong date, a missing sponsor. We catch them before they cost you time.",
      points: [
        "Every application read by a person before processing",
        "Plain-English guidance in English and Somali",
        "Express handling for trips at short notice",
        "Encrypted uploads and secure payment",
      ],
      stat: "24/7",
      statLabel: "Help on WhatsApp",
      imageAlt: "Passport and boarding documents prepared for a trip to Somalia",
    },
    services: {
      eyebrow: "What's included",
      title: "Everything the eVisa asks for, handled.",
      description: "You supply the passport and photo; we take care of the paperwork in between.",
      items: [
        { title: "Requirement check", body: "We confirm your passport validity and photo meet the eVisa rules." },
        { title: "Form completion", body: "Your details are entered carefully, in exactly the format required." },
        { title: "Urgent applications", body: "Express handling for flights in the next day or two." },
        { title: "Real people on WhatsApp", body: "Ask a question at any hour and get an answer from our team." },
        { title: "Data protection", body: "Documents are encrypted in transit and removed once your application is complete." },
        { title: "Travel-ready eVisa", body: "Approval sent by email with notes on what to show at the airport." },
      ],
    },
    cta: {
      title: "Ready to get your eVisa sorted?",
      somali: "Ma diyaar u tahay?",
      body: "Start now — have your passport and a photo to hand and it takes only a few minutes.",
      button: "Start my application",
    },
  },

  about: {
    seoTitle: `About ${SITE.brand} — Somalia eTAS Application Help`,
    seoDescription:
      "EvisaSomalia.com is an independent service that explains the Somalia eVisa process and handles applications for travellers and the Somali diaspora.",
    schemaDescription:
      "Independent guide and application service for the Somalia eVisa (eTAS), checking documents and handling the application for travellers.",
    heroEyebrow: "About EvisaSomalia",
    heroTitle: "We make the Somalia eTAS simple.",
    heroBody:
      "EvisaSomalia.com started with a simple idea: explain the Somalia eVisa in plain language, then do the fiddly parts for you.",
    whoEyebrow: "Who we are",
    whoTitle: "An independent application service.",
    whoParagraphs: [
      "The Somalia eTAS lets visitors and returning diaspora apply for entry online, but documents and dates must be in a very particular format. A cropped passport scan or a mistyped date is enough to send an application back.",
      "We read every application before it is processed, correct the problems that cause delays and keep you updated on WhatsApp until your eVisa arrives.",
    ],
    whatEyebrow: "How we help",
    whatTitle: "Three stages, one point of contact.",
    whatSteps: [
      {
        title: "Gather",
        body: "You upload your passport, photo and travel date through our secure form — usually in under five minutes.",
      },
      {
        title: "Check and process",
        body: "A specialist checks completeness and accuracy, then processes your application.",
      },
      {
        title: "Deliver",
        body: "Once it is approved, your eVisa comes straight to your inbox. Most are issued within 72 hours.",
      },
    ],
    eligibilityEyebrow: "Who it's for",
    eligibilityTitle: "Can I use the Somalia eVisa?",
    eligibility: [
      "Visitors travelling for tourism, business, family or transit",
      "Somali-heritage travellers holding a non-Somali passport",
      "Anyone whose passport has at least six months left after arrival",
      "Applicants who can provide a clear photo and a planned arrival date",
      "Travellers needing entry for up to 180 days",
    ],
    valuesEyebrow: "What we stand for",
    valuesTitle: "Clear, careful and available.",
    values: [
      { label: "Clear", body: "Requirements explained without jargon, in English and Somali." },
      { label: "Careful", body: "A person checks every application before processing." },
      { label: "Quick", body: "Express handling when your trip can't wait." },
      { label: "Worldwide", body: "Helping applicants from all over the world." },
    ],
    ctaTitle: "Let's get your eVisa started.",
    ctaBody: "It takes a few minutes to send us your details. We take it from there.",
  },

  faqs: {
    seoTitle: "Somalia eVisa Questions Answered — Fees, Documents, Timing",
    seoDescription:
      "Straight answers on the Somalia eVisa (eTAS): what it costs, which documents you need, how long approval takes and how diaspora applications work.",
    eyebrow: "Help centre",
    title: "Somalia eVisa questions, answered",
    description: "Short, practical answers to what travellers ask us most.",
    items: [
      {
        q: "What exactly is the Somalia eTAS?",
        a: "The eTAS (Electronic Travel Authorisation System) is the online system Somalia uses to issue entry visas. You apply before travelling and receive the approved eVisa by email.",
      },
      {
        q: "How much will I pay in total?",
        a: `Standard is ${standardFee} and Express is ${expressFee}. The guided application for non-Somali (Ajnabi) visitors is ${ajnabiFee}. Each price is all-inclusive; the £2 card processing fee is already included in the sterling prices.`,
      },
      {
        q: "How long until my eVisa is approved?",
        a: `Standard and Ajnabi applications usually take ${PRICING_TIERS.standard.processingTime}. Express targets about 5–6 hours during Somali working hours.`,
      },
      {
        q: "Which documents should I have ready?",
        a: "Your passport (with at least six months' validity), a recent photo on a plain background, your planned arrival date and an email address. Non-Somali visitors also need sponsor details.",
      },
      {
        q: "I'm Somali but hold a foreign passport — which option do I choose?",
        a: "Use Standard or Express. They are designed for the diaspora: upload your passport and photo, add a few details and we complete the rest.",
      },
      {
        q: "Who needs a sponsor?",
        a: "Visitors who are not of Somali heritage (Ajnabi) need a local sponsor. The guided application (Option 3) collects those details step by step.",
      },
      {
        q: "Are you part of the Somali government?",
        a: `No. ${SITE.brand} is an independent private visa service, not a government website.`,
      },
      {
        q: "How is the eVisa delivered?",
        a: "By email, with a WhatsApp notification as soon as it is issued. Keep a printed or digital copy for check-in and arrival.",
      },
      {
        q: "Can I check progress?",
        a: "Yes — enter your reference and email on the Status page to see where your application is.",
      },
      {
        q: "What if the application is refused?",
        a: "We tell you the reason and help you correct and resubmit where that's possible.",
      },
      {
        q: "How long can I stay?",
        a: "The eVisa is valid for up to 180 days from the date it is issued; you need to enter Somalia within that period.",
      },
      {
        q: "Is my information safe?",
        a: "Uploads are encrypted and stored securely, used only to process your application, and never sold.",
      },
    ],
  },

  documents: {
    seoTitle: `Somalia eTAS Document Checklist | ${SITE.brand}`,
    seoDescription:
      "The five things to prepare before applying for a Somalia eVisa: passport validity, photo rules, arrival date, sponsor letter (non-Somali visitors) and payment.",
    howToName: "Preparing a Somalia eVisa (eTAS) application",
    howToDescription: "Checklist of what to gather before you start a Somalia eVisa application.",
    eyebrow: "Before you start",
    title: "Your Somalia eTAS document checklist.",
    description: "Gather these first and the application takes only a few minutes.",
    items: [
      { title: "Passport", body: "At least six months' validity left after you arrive, and a couple of blank pages for stamps." },
      { title: "Photo", body: "Taken in the last six months: face forward, plain pale background, no filters." },
      { title: "Arrival date", body: "The day you expect to land in Somalia — it doesn't need to be exact to the hour." },
      { title: "Sponsor letter", body: "Only for visitors without Somali heritage (Ajnabi): an invitation or sponsor letter from your contact in Somalia." },
      { title: "Card payment", body: `A debit or credit card for the fee, which starts at ${standardFee} all-inclusive.` },
    ],
  },

  visaIndex: {
    seoTitle: `Somalia eVisa Guides by Passport Country | ${SITE.brand}`,
    seoDescription: (count) =>
      `Pick your passport from ${count} countries to see the Somalia eTAS checklist, fees and timings that apply to you, then apply online with a specialist check.`,
    eyebrow: "Country guides",
    h1: "Find the Somalia eVisa guide for your passport",
    intro: "Each guide lists the documents, costs and processing times for travellers of that nationality.",
    note: "Whatever passport you hold, entry to Somalia requires an eVisa issued through the eTAS before you fly. Travellers of Somali heritage with a foreign passport use the same online system. Choose your country below.",
    listName: "Somalia eVisa guides by passport country",
    label: (country) => `${country} passport guide`,
    sublabel: (demonym) => `For ${demonym} travellers`,
  },

  country,
};

export default content;
