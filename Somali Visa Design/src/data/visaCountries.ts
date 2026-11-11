export const VISA_REGIONS = [
  "Africa",
  "Europe",
  "Middle East",
  "Asia",
  "North America",
  "Central America & Caribbean",
  "South America",
  "Oceania",
] as const;

export type VisaRegion = (typeof VISA_REGIONS)[number];

export interface VisaCountryInfo {
  slug: string;
  country: string;
  demonym: string;
  flag: string;
  intro: string;
  highlight: string;
  region: VisaRegion;
  /** Shown in the footer's "Visas by Nationality" strip. */
  popular?: boolean;
}

export const visaCountries: VisaCountryInfo[] = [
  {
    slug: "usa",
    country: "United States",
    demonym: "American",
    flag: "🇺🇸",
    region: "North America",
    popular: true,
    intro:
      "U.S. passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps American applicants complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "We support tourist, business, and family-visit applications for U.S. citizens, including return visits for the Somali-American diaspora.",
  },
  {
    slug: "united-kingdom",
    country: "United Kingdom",
    demonym: "British",
    flag: "🇬🇧",
    region: "Europe",
    popular: true,
    intro:
      "British citizens travelling to Somalia must hold a valid eVisa before departure. Our specialists guide UK passport holders through the Somalia eTAS process from start to finish, so nothing is missed.",
    highlight:
      "We're a UK-registered company, and we regularly assist UK-based Somali diaspora visiting family, as well as business and humanitarian travellers.",
  },
  {
    slug: "sweden",
    country: "Sweden",
    demonym: "Swedish",
    flag: "🇸🇪",
    region: "Europe",
    popular: true,
    intro:
      "Swedish passport holders need an approved eVisa to enter Somalia. eVisaSomali assists applicants across Sweden with document preparation and submission to the official portal.",
    highlight:
      "We regularly help members of the large Somali community in Sweden travelling home to visit family or attend to personal matters.",
  },
  {
    slug: "kenya",
    country: "Kenya",
    demonym: "Kenyan",
    flag: "🇰🇪",
    region: "Africa",
    popular: true,
    intro:
      "Kenyan citizens require an electronic visa to travel to Somalia. eVisaSomali helps applicants in Kenya — including the wider East African Somali diaspora — prepare a complete, accurate application.",
    highlight:
      "Given the close ties and frequent travel between Kenya and Somalia, we pay special attention to getting documentation right the first time to help avoid delays at the border.",
  },
  {
    slug: "denmark",
    country: "Denmark",
    demonym: "Danish",
    flag: "🇩🇰",
    region: "Europe",
    popular: true,
    intro:
      "Danish passport holders must obtain a Somalia eVisa before travel. Our team supports applicants throughout Denmark with clear, step-by-step guidance and thorough document checks.",
    highlight:
      "We assist Danish-Somali families travelling for visits, weddings, and other family occasions.",
  },
  {
    slug: "canada",
    country: "Canada",
    demonym: "Canadian",
    flag: "🇨🇦",
    region: "North America",
    popular: true,
    intro:
      "Canadian citizens need a valid eVisa to enter Somalia. eVisaSomali provides a straightforward online application process for travellers across Canada, with updates sent directly to your email and WhatsApp.",
    highlight:
      "We support both first-time travellers and returning members of the Somali-Canadian community.",
  },
  {
    slug: "france",
    country: "France",
    demonym: "French",
    flag: "🇫🇷",
    region: "Europe",
    popular: true,
    intro:
      "French passport holders are required to secure an eVisa prior to arrival in Somalia. We help applicants throughout France complete the Somalia eTAS form correctly and submit it without delay.",
    highlight:
      "Our specialists are experienced in handling both tourism and business travel applications from France.",
  },
  {
    slug: "germany",
    country: "Germany",
    demonym: "German",
    flag: "🇩🇪",
    region: "Europe",
    popular: true,
    intro:
      "German citizens must hold an approved eVisa to enter Somalia. eVisaSomali assists applicants based in Germany with document review and submission to the official Somalia eTAS system.",
    highlight:
      "We regularly support the Somali-German community travelling for family visits, business, and community events.",
  },
  {
    slug: "netherlands",
    country: "Netherlands",
    demonym: "Dutch",
    flag: "🇳🇱",
    region: "Europe",
    popular: true,
    intro:
      "Dutch passport holders need a valid eVisa before travelling to Somalia. Our team helps applicants throughout the Netherlands prepare accurate applications and avoid common submission errors.",
    highlight:
      "We assist many members of the Somali community in the Netherlands travelling to visit relatives or manage family affairs.",
  },
  {
    slug: "south-africa",
    country: "South Africa",
    demonym: "South African",
    flag: "🇿🇦",
    region: "Africa",
    popular: true,
    intro:
      "South African citizens are required to obtain an eVisa before entering Somalia. eVisaSomali supports applicants across South Africa with a simple online process and specialist document checks.",
    highlight:
      "We help travellers from South Africa's Somali business and diaspora communities prepare complete applications quickly.",
  },
  {
    slug: "algeria",
    country: "Algeria",
    demonym: "Algerian",
    flag: "🇩🇿",
    region: "Africa",
    intro:
      "Algerian passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Algeria complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travel between Algeria and Somalia is common for business, trade and family reasons. We check every document carefully so Algerian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "angola",
    country: "Angola",
    demonym: "Angolan",
    flag: "🇦🇴",
    region: "Africa",
    intro:
      "Travellers from Angola must hold a valid Somalia eVisa before departure. Our specialists guide Angolan citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travel between Angola and Somalia is common for business, trade and family reasons. We check every document carefully so Angolan applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "benin",
    country: "Benin",
    demonym: "Beninese",
    flag: "🇧🇯",
    region: "Africa",
    intro:
      "Beninese citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Benin, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travel between Benin and Somalia is common for business, trade and family reasons. We check every document carefully so Beninese applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "botswana",
    country: "Botswana",
    demonym: "Botswanan",
    flag: "🇧🇼",
    region: "Africa",
    intro:
      "If you hold a Botswanan passport, you need an approved eVisa to visit Somalia. We help applicants from Botswana prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travel between Botswana and Somalia is common for business, trade and family reasons. We check every document carefully so Botswanan applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "burkina-faso",
    country: "Burkina Faso",
    demonym: "Burkinabè",
    flag: "🇧🇫",
    region: "Africa",
    intro:
      "Burkinabè passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Burkina Faso complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travel between Burkina Faso and Somalia is common for business, trade and family reasons. We check every document carefully so Burkinabè applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "burundi",
    country: "Burundi",
    demonym: "Burundian",
    flag: "🇧🇮",
    region: "Africa",
    intro:
      "Travellers from Burundi must hold a valid Somalia eVisa before departure. Our specialists guide Burundian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travel between Burundi and Somalia is common for business, trade and family reasons. We check every document carefully so Burundian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "cabo-verde",
    country: "Cabo Verde",
    demonym: "Cabo Verdean",
    flag: "🇨🇻",
    region: "Africa",
    intro:
      "Cabo Verdean citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Cabo Verde, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travel between Cabo Verde and Somalia is common for business, trade and family reasons. We check every document carefully so Cabo Verdean applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "cameroon",
    country: "Cameroon",
    demonym: "Cameroonian",
    flag: "🇨🇲",
    region: "Africa",
    intro:
      "If you hold a Cameroonian passport, you need an approved eVisa to visit Somalia. We help applicants from Cameroon prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travel between Cameroon and Somalia is common for business, trade and family reasons. We check every document carefully so Cameroonian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "central-african-republic",
    country: "Central African Republic",
    demonym: "Central African",
    flag: "🇨🇫",
    region: "Africa",
    intro:
      "Central African passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Central African Republic complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travel between Central African Republic and Somalia is common for business, trade and family reasons. We check every document carefully so Central African applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "chad",
    country: "Chad",
    demonym: "Chadian",
    flag: "🇹🇩",
    region: "Africa",
    intro:
      "Travellers from Chad must hold a valid Somalia eVisa before departure. Our specialists guide Chadian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travel between Chad and Somalia is common for business, trade and family reasons. We check every document carefully so Chadian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "comoros",
    country: "Comoros",
    demonym: "Comorian",
    flag: "🇰🇲",
    region: "Africa",
    intro:
      "Comorian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Comoros, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travel between Comoros and Somalia is common for business, trade and family reasons. We check every document carefully so Comorian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "congo",
    country: "Congo",
    demonym: "Congolese",
    flag: "🇨🇬",
    region: "Africa",
    intro:
      "If you hold a Congolese passport, you need an approved eVisa to visit Somalia. We help applicants from Congo prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travel between Congo and Somalia is common for business, trade and family reasons. We check every document carefully so Congolese applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "democratic-republic-of-the-congo",
    country: "Democratic Republic of the Congo",
    demonym: "Congolese (DRC)",
    flag: "🇨🇩",
    region: "Africa",
    intro:
      "Congolese (DRC) passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Democratic Republic of the Congo complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travel between Democratic Republic of the Congo and Somalia is common for business, trade and family reasons. We check every document carefully so Congolese (DRC) applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "cote-divoire",
    country: "Côte d'Ivoire",
    demonym: "Ivorian",
    flag: "🇨🇮",
    region: "Africa",
    intro:
      "Travellers from Côte d'Ivoire must hold a valid Somalia eVisa before departure. Our specialists guide Ivorian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travel between Côte d'Ivoire and Somalia is common for business, trade and family reasons. We check every document carefully so Ivorian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "djibouti",
    country: "Djibouti",
    demonym: "Djiboutian",
    flag: "🇩🇯",
    region: "Africa",
    intro:
      "Djiboutian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Djibouti, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "We regularly help members of the Somali community in Djibouti travelling home to visit family, as well as Djiboutian business, humanitarian and tourist travellers.",
  },
  {
    slug: "egypt",
    country: "Egypt",
    demonym: "Egyptian",
    flag: "🇪🇬",
    region: "Africa",
    intro:
      "If you hold an Egyptian passport, you need an approved eVisa to visit Somalia. We help applicants from Egypt prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "We regularly help members of the Somali community in Egypt travelling home to visit family, as well as Egyptian business, humanitarian and tourist travellers.",
  },
  {
    slug: "equatorial-guinea",
    country: "Equatorial Guinea",
    demonym: "Equatoguinean",
    flag: "🇬🇶",
    region: "Africa",
    intro:
      "Equatoguinean passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Equatorial Guinea complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travel between Equatorial Guinea and Somalia is common for business, trade and family reasons. We check every document carefully so Equatoguinean applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "eritrea",
    country: "Eritrea",
    demonym: "Eritrean",
    flag: "🇪🇷",
    region: "Africa",
    intro:
      "Travellers from Eritrea must hold a valid Somalia eVisa before departure. Our specialists guide Eritrean citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travel between Eritrea and Somalia is common for business, trade and family reasons. We check every document carefully so Eritrean applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "eswatini",
    country: "Eswatini",
    demonym: "Swazi",
    flag: "🇸🇿",
    region: "Africa",
    intro:
      "Swazi citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Eswatini, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travel between Eswatini and Somalia is common for business, trade and family reasons. We check every document carefully so Swazi applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "ethiopia",
    country: "Ethiopia",
    demonym: "Ethiopian",
    flag: "🇪🇹",
    region: "Africa",
    intro:
      "If you hold an Ethiopian passport, you need an approved eVisa to visit Somalia. We help applicants from Ethiopia prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "We regularly help members of the Somali community in Ethiopia travelling home to visit family, as well as Ethiopian business, humanitarian and tourist travellers.",
  },
  {
    slug: "gabon",
    country: "Gabon",
    demonym: "Gabonese",
    flag: "🇬🇦",
    region: "Africa",
    intro:
      "Gabonese passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Gabon complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travel between Gabon and Somalia is common for business, trade and family reasons. We check every document carefully so Gabonese applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "gambia",
    country: "Gambia",
    demonym: "Gambian",
    flag: "🇬🇲",
    region: "Africa",
    intro:
      "Travellers from Gambia must hold a valid Somalia eVisa before departure. Our specialists guide Gambian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travel between Gambia and Somalia is common for business, trade and family reasons. We check every document carefully so Gambian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "ghana",
    country: "Ghana",
    demonym: "Ghanaian",
    flag: "🇬🇭",
    region: "Africa",
    intro:
      "Ghanaian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Ghana, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travel between Ghana and Somalia is common for business, trade and family reasons. We check every document carefully so Ghanaian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "guinea",
    country: "Guinea",
    demonym: "Guinean",
    flag: "🇬🇳",
    region: "Africa",
    intro:
      "If you hold a Guinean passport, you need an approved eVisa to visit Somalia. We help applicants from Guinea prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travel between Guinea and Somalia is common for business, trade and family reasons. We check every document carefully so Guinean applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "guinea-bissau",
    country: "Guinea-Bissau",
    demonym: "Bissau-Guinean",
    flag: "🇬🇼",
    region: "Africa",
    intro:
      "Bissau-Guinean passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Guinea-Bissau complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travel between Guinea-Bissau and Somalia is common for business, trade and family reasons. We check every document carefully so Bissau-Guinean applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "lesotho",
    country: "Lesotho",
    demonym: "Basotho",
    flag: "🇱🇸",
    region: "Africa",
    intro:
      "Travellers from Lesotho must hold a valid Somalia eVisa before departure. Our specialists guide Basotho citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travel between Lesotho and Somalia is common for business, trade and family reasons. We check every document carefully so Basotho applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "liberia",
    country: "Liberia",
    demonym: "Liberian",
    flag: "🇱🇷",
    region: "Africa",
    intro:
      "Liberian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Liberia, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travel between Liberia and Somalia is common for business, trade and family reasons. We check every document carefully so Liberian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "libya",
    country: "Libya",
    demonym: "Libyan",
    flag: "🇱🇾",
    region: "Africa",
    intro:
      "If you hold a Libyan passport, you need an approved eVisa to visit Somalia. We help applicants from Libya prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travel between Libya and Somalia is common for business, trade and family reasons. We check every document carefully so Libyan applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "madagascar",
    country: "Madagascar",
    demonym: "Malagasy",
    flag: "🇲🇬",
    region: "Africa",
    intro:
      "Malagasy passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Madagascar complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travel between Madagascar and Somalia is common for business, trade and family reasons. We check every document carefully so Malagasy applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "malawi",
    country: "Malawi",
    demonym: "Malawian",
    flag: "🇲🇼",
    region: "Africa",
    intro:
      "Travellers from Malawi must hold a valid Somalia eVisa before departure. Our specialists guide Malawian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travel between Malawi and Somalia is common for business, trade and family reasons. We check every document carefully so Malawian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "mali",
    country: "Mali",
    demonym: "Malian",
    flag: "🇲🇱",
    region: "Africa",
    intro:
      "Malian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Mali, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travel between Mali and Somalia is common for business, trade and family reasons. We check every document carefully so Malian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "mauritania",
    country: "Mauritania",
    demonym: "Mauritanian",
    flag: "🇲🇷",
    region: "Africa",
    intro:
      "If you hold a Mauritanian passport, you need an approved eVisa to visit Somalia. We help applicants from Mauritania prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travel between Mauritania and Somalia is common for business, trade and family reasons. We check every document carefully so Mauritanian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "mauritius",
    country: "Mauritius",
    demonym: "Mauritian",
    flag: "🇲🇺",
    region: "Africa",
    intro:
      "Mauritian passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Mauritius complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travel between Mauritius and Somalia is common for business, trade and family reasons. We check every document carefully so Mauritian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "morocco",
    country: "Morocco",
    demonym: "Moroccan",
    flag: "🇲🇦",
    region: "Africa",
    intro:
      "Travellers from Morocco must hold a valid Somalia eVisa before departure. Our specialists guide Moroccan citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travel between Morocco and Somalia is common for business, trade and family reasons. We check every document carefully so Moroccan applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "mozambique",
    country: "Mozambique",
    demonym: "Mozambican",
    flag: "🇲🇿",
    region: "Africa",
    intro:
      "Mozambican citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Mozambique, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travel between Mozambique and Somalia is common for business, trade and family reasons. We check every document carefully so Mozambican applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "namibia",
    country: "Namibia",
    demonym: "Namibian",
    flag: "🇳🇦",
    region: "Africa",
    intro:
      "If you hold a Namibian passport, you need an approved eVisa to visit Somalia. We help applicants from Namibia prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travel between Namibia and Somalia is common for business, trade and family reasons. We check every document carefully so Namibian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "niger",
    country: "Niger",
    demonym: "Nigerien",
    flag: "🇳🇪",
    region: "Africa",
    intro:
      "Nigerien passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Niger complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travel between Niger and Somalia is common for business, trade and family reasons. We check every document carefully so Nigerien applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "nigeria",
    country: "Nigeria",
    demonym: "Nigerian",
    flag: "🇳🇬",
    region: "Africa",
    intro:
      "Travellers from Nigeria must hold a valid Somalia eVisa before departure. Our specialists guide Nigerian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travel between Nigeria and Somalia is common for business, trade and family reasons. We check every document carefully so Nigerian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "rwanda",
    country: "Rwanda",
    demonym: "Rwandan",
    flag: "🇷🇼",
    region: "Africa",
    intro:
      "Rwandan citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Rwanda, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travel between Rwanda and Somalia is common for business, trade and family reasons. We check every document carefully so Rwandan applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "sao-tome-and-principe",
    country: "São Tomé and Príncipe",
    demonym: "São Toméan",
    flag: "🇸🇹",
    region: "Africa",
    intro:
      "If you hold a São Toméan passport, you need an approved eVisa to visit Somalia. We help applicants from São Tomé and Príncipe prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travel between São Tomé and Príncipe and Somalia is common for business, trade and family reasons. We check every document carefully so São Toméan applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "senegal",
    country: "Senegal",
    demonym: "Senegalese",
    flag: "🇸🇳",
    region: "Africa",
    intro:
      "Senegalese passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Senegal complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travel between Senegal and Somalia is common for business, trade and family reasons. We check every document carefully so Senegalese applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "seychelles",
    country: "Seychelles",
    demonym: "Seychellois",
    flag: "🇸🇨",
    region: "Africa",
    intro:
      "Travellers from Seychelles must hold a valid Somalia eVisa before departure. Our specialists guide Seychellois citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travel between Seychelles and Somalia is common for business, trade and family reasons. We check every document carefully so Seychellois applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "sierra-leone",
    country: "Sierra Leone",
    demonym: "Sierra Leonean",
    flag: "🇸🇱",
    region: "Africa",
    intro:
      "Sierra Leonean citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Sierra Leone, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travel between Sierra Leone and Somalia is common for business, trade and family reasons. We check every document carefully so Sierra Leonean applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "south-sudan",
    country: "South Sudan",
    demonym: "South Sudanese",
    flag: "🇸🇸",
    region: "Africa",
    intro:
      "If you hold a South Sudanese passport, you need an approved eVisa to visit Somalia. We help applicants from South Sudan prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travel between South Sudan and Somalia is common for business, trade and family reasons. We check every document carefully so South Sudanese applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "sudan",
    country: "Sudan",
    demonym: "Sudanese",
    flag: "🇸🇩",
    region: "Africa",
    intro:
      "Sudanese passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Sudan complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travel between Sudan and Somalia is common for business, trade and family reasons. We check every document carefully so Sudanese applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "tanzania",
    country: "Tanzania",
    demonym: "Tanzanian",
    flag: "🇹🇿",
    region: "Africa",
    intro:
      "Travellers from Tanzania must hold a valid Somalia eVisa before departure. Our specialists guide Tanzanian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "We regularly help members of the Somali community in Tanzania travelling home to visit family, as well as Tanzanian business, humanitarian and tourist travellers.",
  },
  {
    slug: "togo",
    country: "Togo",
    demonym: "Togolese",
    flag: "🇹🇬",
    region: "Africa",
    intro:
      "Togolese citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Togo, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travel between Togo and Somalia is common for business, trade and family reasons. We check every document carefully so Togolese applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "tunisia",
    country: "Tunisia",
    demonym: "Tunisian",
    flag: "🇹🇳",
    region: "Africa",
    intro:
      "If you hold a Tunisian passport, you need an approved eVisa to visit Somalia. We help applicants from Tunisia prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travel between Tunisia and Somalia is common for business, trade and family reasons. We check every document carefully so Tunisian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "uganda",
    country: "Uganda",
    demonym: "Ugandan",
    flag: "🇺🇬",
    region: "Africa",
    intro:
      "Ugandan passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Uganda complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "We regularly help members of the Somali community in Uganda travelling home to visit family, as well as Ugandan business, humanitarian and tourist travellers.",
  },
  {
    slug: "zambia",
    country: "Zambia",
    demonym: "Zambian",
    flag: "🇿🇲",
    region: "Africa",
    intro:
      "Travellers from Zambia must hold a valid Somalia eVisa before departure. Our specialists guide Zambian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travel between Zambia and Somalia is common for business, trade and family reasons. We check every document carefully so Zambian applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "zimbabwe",
    country: "Zimbabwe",
    demonym: "Zimbabwean",
    flag: "🇿🇼",
    region: "Africa",
    intro:
      "Zimbabwean citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Zimbabwe, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travel between Zimbabwe and Somalia is common for business, trade and family reasons. We check every document carefully so Zimbabwean applicants avoid delays on arrival in Mogadishu, Hargeisa or Garowe.",
  },
  {
    slug: "albania",
    country: "Albania",
    demonym: "Albanian",
    flag: "🇦🇱",
    region: "Europe",
    intro:
      "If you hold an Albanian passport, you need an approved eVisa to visit Somalia. We help applicants from Albania prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Most travellers from Albania reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "andorra",
    country: "Andorra",
    demonym: "Andorran",
    flag: "🇦🇩",
    region: "Europe",
    intro:
      "Andorran passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Andorra complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Most travellers from Andorra reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "austria",
    country: "Austria",
    demonym: "Austrian",
    flag: "🇦🇹",
    region: "Europe",
    intro:
      "Travellers from Austria must hold a valid Somalia eVisa before departure. Our specialists guide Austrian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "We regularly help members of the Somali community in Austria travelling home to visit family, as well as Austrian business, humanitarian and tourist travellers.",
  },
  {
    slug: "belarus",
    country: "Belarus",
    demonym: "Belarusian",
    flag: "🇧🇾",
    region: "Europe",
    intro:
      "Belarusian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Belarus, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Most travellers from Belarus reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "belgium",
    country: "Belgium",
    demonym: "Belgian",
    flag: "🇧🇪",
    region: "Europe",
    intro:
      "If you hold a Belgian passport, you need an approved eVisa to visit Somalia. We help applicants from Belgium prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "We regularly help members of the Somali community in Belgium travelling home to visit family, as well as Belgian business, humanitarian and tourist travellers.",
  },
  {
    slug: "bosnia-and-herzegovina",
    country: "Bosnia and Herzegovina",
    demonym: "Bosnian",
    flag: "🇧🇦",
    region: "Europe",
    intro:
      "Bosnian passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Bosnia and Herzegovina complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Most travellers from Bosnia and Herzegovina reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "bulgaria",
    country: "Bulgaria",
    demonym: "Bulgarian",
    flag: "🇧🇬",
    region: "Europe",
    intro:
      "Travellers from Bulgaria must hold a valid Somalia eVisa before departure. Our specialists guide Bulgarian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Most travellers from Bulgaria reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "croatia",
    country: "Croatia",
    demonym: "Croatian",
    flag: "🇭🇷",
    region: "Europe",
    intro:
      "Croatian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Croatia, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Most travellers from Croatia reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "cyprus",
    country: "Cyprus",
    demonym: "Cypriot",
    flag: "🇨🇾",
    region: "Europe",
    intro:
      "If you hold a Cypriot passport, you need an approved eVisa to visit Somalia. We help applicants from Cyprus prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Most travellers from Cyprus reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "czechia",
    country: "Czechia",
    demonym: "Czech",
    flag: "🇨🇿",
    region: "Europe",
    intro:
      "Czech passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Czechia complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Most travellers from Czechia reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "estonia",
    country: "Estonia",
    demonym: "Estonian",
    flag: "🇪🇪",
    region: "Europe",
    intro:
      "Travellers from Estonia must hold a valid Somalia eVisa before departure. Our specialists guide Estonian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Most travellers from Estonia reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "finland",
    country: "Finland",
    demonym: "Finnish",
    flag: "🇫🇮",
    region: "Europe",
    intro:
      "Finnish citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Finland, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "We regularly help members of the Somali community in Finland travelling home to visit family, as well as Finnish business, humanitarian and tourist travellers.",
  },
  {
    slug: "greece",
    country: "Greece",
    demonym: "Greek",
    flag: "🇬🇷",
    region: "Europe",
    intro:
      "If you hold a Greek passport, you need an approved eVisa to visit Somalia. We help applicants from Greece prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Most travellers from Greece reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "hungary",
    country: "Hungary",
    demonym: "Hungarian",
    flag: "🇭🇺",
    region: "Europe",
    intro:
      "Hungarian passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Hungary complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Most travellers from Hungary reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "iceland",
    country: "Iceland",
    demonym: "Icelandic",
    flag: "🇮🇸",
    region: "Europe",
    intro:
      "Travellers from Iceland must hold a valid Somalia eVisa before departure. Our specialists guide Icelandic citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Most travellers from Iceland reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "ireland",
    country: "Ireland",
    demonym: "Irish",
    flag: "🇮🇪",
    region: "Europe",
    intro:
      "Irish citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Ireland, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "We regularly help members of the Somali community in Ireland travelling home to visit family, as well as Irish business, humanitarian and tourist travellers.",
  },
  {
    slug: "italy",
    country: "Italy",
    demonym: "Italian",
    flag: "🇮🇹",
    region: "Europe",
    intro:
      "If you hold an Italian passport, you need an approved eVisa to visit Somalia. We help applicants from Italy prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "We regularly help members of the Somali community in Italy travelling home to visit family, as well as Italian business, humanitarian and tourist travellers.",
  },
  {
    slug: "kosovo",
    country: "Kosovo",
    demonym: "Kosovar",
    flag: "🇽🇰",
    region: "Europe",
    intro:
      "Kosovar passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Kosovo complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Most travellers from Kosovo reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "latvia",
    country: "Latvia",
    demonym: "Latvian",
    flag: "🇱🇻",
    region: "Europe",
    intro:
      "Travellers from Latvia must hold a valid Somalia eVisa before departure. Our specialists guide Latvian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Most travellers from Latvia reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "liechtenstein",
    country: "Liechtenstein",
    demonym: "Liechtensteiner",
    flag: "🇱🇮",
    region: "Europe",
    intro:
      "Liechtensteiner citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Liechtenstein, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Most travellers from Liechtenstein reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "lithuania",
    country: "Lithuania",
    demonym: "Lithuanian",
    flag: "🇱🇹",
    region: "Europe",
    intro:
      "If you hold a Lithuanian passport, you need an approved eVisa to visit Somalia. We help applicants from Lithuania prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Most travellers from Lithuania reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "luxembourg",
    country: "Luxembourg",
    demonym: "Luxembourgish",
    flag: "🇱🇺",
    region: "Europe",
    intro:
      "Luxembourgish passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Luxembourg complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Most travellers from Luxembourg reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "malta",
    country: "Malta",
    demonym: "Maltese",
    flag: "🇲🇹",
    region: "Europe",
    intro:
      "Travellers from Malta must hold a valid Somalia eVisa before departure. Our specialists guide Maltese citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Most travellers from Malta reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "moldova",
    country: "Moldova",
    demonym: "Moldovan",
    flag: "🇲🇩",
    region: "Europe",
    intro:
      "Moldovan citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Moldova, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Most travellers from Moldova reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "monaco",
    country: "Monaco",
    demonym: "Monégasque",
    flag: "🇲🇨",
    region: "Europe",
    intro:
      "If you hold a Monégasque passport, you need an approved eVisa to visit Somalia. We help applicants from Monaco prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Most travellers from Monaco reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "montenegro",
    country: "Montenegro",
    demonym: "Montenegrin",
    flag: "🇲🇪",
    region: "Europe",
    intro:
      "Montenegrin passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Montenegro complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Most travellers from Montenegro reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "north-macedonia",
    country: "North Macedonia",
    demonym: "North Macedonian",
    flag: "🇲🇰",
    region: "Europe",
    intro:
      "Travellers from North Macedonia must hold a valid Somalia eVisa before departure. Our specialists guide North Macedonian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Most travellers from North Macedonia reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "norway",
    country: "Norway",
    demonym: "Norwegian",
    flag: "🇳🇴",
    region: "Europe",
    intro:
      "Norwegian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Norway, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "We regularly help members of the Somali community in Norway travelling home to visit family, as well as Norwegian business, humanitarian and tourist travellers.",
  },
  {
    slug: "poland",
    country: "Poland",
    demonym: "Polish",
    flag: "🇵🇱",
    region: "Europe",
    intro:
      "If you hold a Polish passport, you need an approved eVisa to visit Somalia. We help applicants from Poland prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Most travellers from Poland reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "portugal",
    country: "Portugal",
    demonym: "Portuguese",
    flag: "🇵🇹",
    region: "Europe",
    intro:
      "Portuguese passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Portugal complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Most travellers from Portugal reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "romania",
    country: "Romania",
    demonym: "Romanian",
    flag: "🇷🇴",
    region: "Europe",
    intro:
      "Travellers from Romania must hold a valid Somalia eVisa before departure. Our specialists guide Romanian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Most travellers from Romania reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "russia",
    country: "Russia",
    demonym: "Russian",
    flag: "🇷🇺",
    region: "Europe",
    intro:
      "Russian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Russia, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Most travellers from Russia reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "san-marino",
    country: "San Marino",
    demonym: "Sammarinese",
    flag: "🇸🇲",
    region: "Europe",
    intro:
      "If you hold a Sammarinese passport, you need an approved eVisa to visit Somalia. We help applicants from San Marino prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Most travellers from San Marino reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "serbia",
    country: "Serbia",
    demonym: "Serbian",
    flag: "🇷🇸",
    region: "Europe",
    intro:
      "Serbian passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Serbia complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Most travellers from Serbia reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "slovakia",
    country: "Slovakia",
    demonym: "Slovak",
    flag: "🇸🇰",
    region: "Europe",
    intro:
      "Travellers from Slovakia must hold a valid Somalia eVisa before departure. Our specialists guide Slovak citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Most travellers from Slovakia reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "slovenia",
    country: "Slovenia",
    demonym: "Slovenian",
    flag: "🇸🇮",
    region: "Europe",
    intro:
      "Slovenian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Slovenia, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Most travellers from Slovenia reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "spain",
    country: "Spain",
    demonym: "Spanish",
    flag: "🇪🇸",
    region: "Europe",
    intro:
      "If you hold a Spanish passport, you need an approved eVisa to visit Somalia. We help applicants from Spain prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "We regularly help members of the Somali community in Spain travelling home to visit family, as well as Spanish business, humanitarian and tourist travellers.",
  },
  {
    slug: "switzerland",
    country: "Switzerland",
    demonym: "Swiss",
    flag: "🇨🇭",
    region: "Europe",
    intro:
      "Swiss passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Switzerland complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "We regularly help members of the Somali community in Switzerland travelling home to visit family, as well as Swiss business, humanitarian and tourist travellers.",
  },
  {
    slug: "ukraine",
    country: "Ukraine",
    demonym: "Ukrainian",
    flag: "🇺🇦",
    region: "Europe",
    intro:
      "Travellers from Ukraine must hold a valid Somalia eVisa before departure. Our specialists guide Ukrainian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Most travellers from Ukraine reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "vatican-city",
    country: "Vatican City",
    demonym: "Vatican",
    flag: "🇻🇦",
    region: "Europe",
    intro:
      "Vatican citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Vatican City, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Most travellers from Vatican City reach Somalia via connecting hubs such as Istanbul, Dubai, Doha or Addis Ababa. We make sure your eVisa is approved before you board, so you can travel with confidence.",
  },
  {
    slug: "bahrain",
    country: "Bahrain",
    demonym: "Bahraini",
    flag: "🇧🇭",
    region: "Middle East",
    intro:
      "If you hold a Bahraini passport, you need an approved eVisa to visit Somalia. We help applicants from Bahrain prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "With frequent direct and connecting flights from the Gulf and wider Middle East, Bahraini travellers often visit Somalia for business, trade and family. We prepare your application so it is ready well before your flight.",
  },
  {
    slug: "iran",
    country: "Iran",
    demonym: "Iranian",
    flag: "🇮🇷",
    region: "Middle East",
    intro:
      "Iranian passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Iran complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "With frequent direct and connecting flights from the Gulf and wider Middle East, Iranian travellers often visit Somalia for business, trade and family. We prepare your application so it is ready well before your flight.",
  },
  {
    slug: "iraq",
    country: "Iraq",
    demonym: "Iraqi",
    flag: "🇮🇶",
    region: "Middle East",
    intro:
      "Travellers from Iraq must hold a valid Somalia eVisa before departure. Our specialists guide Iraqi citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "With frequent direct and connecting flights from the Gulf and wider Middle East, Iraqi travellers often visit Somalia for business, trade and family. We prepare your application so it is ready well before your flight.",
  },
  {
    slug: "jordan",
    country: "Jordan",
    demonym: "Jordanian",
    flag: "🇯🇴",
    region: "Middle East",
    intro:
      "Jordanian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Jordan, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "With frequent direct and connecting flights from the Gulf and wider Middle East, Jordanian travellers often visit Somalia for business, trade and family. We prepare your application so it is ready well before your flight.",
  },
  {
    slug: "kuwait",
    country: "Kuwait",
    demonym: "Kuwaiti",
    flag: "🇰🇼",
    region: "Middle East",
    intro:
      "If you hold a Kuwaiti passport, you need an approved eVisa to visit Somalia. We help applicants from Kuwait prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "We regularly help members of the Somali community in Kuwait travelling home to visit family, as well as Kuwaiti business, humanitarian and tourist travellers.",
  },
  {
    slug: "lebanon",
    country: "Lebanon",
    demonym: "Lebanese",
    flag: "🇱🇧",
    region: "Middle East",
    intro:
      "Lebanese passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Lebanon complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "With frequent direct and connecting flights from the Gulf and wider Middle East, Lebanese travellers often visit Somalia for business, trade and family. We prepare your application so it is ready well before your flight.",
  },
  {
    slug: "oman",
    country: "Oman",
    demonym: "Omani",
    flag: "🇴🇲",
    region: "Middle East",
    intro:
      "Travellers from Oman must hold a valid Somalia eVisa before departure. Our specialists guide Omani citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "We regularly help members of the Somali community in Oman travelling home to visit family, as well as Omani business, humanitarian and tourist travellers.",
  },
  {
    slug: "palestine",
    country: "Palestine",
    demonym: "Palestinian",
    flag: "🇵🇸",
    region: "Middle East",
    intro:
      "Palestinian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Palestine, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "With frequent direct and connecting flights from the Gulf and wider Middle East, Palestinian travellers often visit Somalia for business, trade and family. We prepare your application so it is ready well before your flight.",
  },
  {
    slug: "qatar",
    country: "Qatar",
    demonym: "Qatari",
    flag: "🇶🇦",
    region: "Middle East",
    intro:
      "If you hold a Qatari passport, you need an approved eVisa to visit Somalia. We help applicants from Qatar prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "We regularly help members of the Somali community in Qatar travelling home to visit family, as well as Qatari business, humanitarian and tourist travellers.",
  },
  {
    slug: "saudi-arabia",
    country: "Saudi Arabia",
    demonym: "Saudi",
    flag: "🇸🇦",
    region: "Middle East",
    intro:
      "Saudi passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Saudi Arabia complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "We regularly help members of the Somali community in Saudi Arabia travelling home to visit family, as well as Saudi business, humanitarian and tourist travellers.",
  },
  {
    slug: "syria",
    country: "Syria",
    demonym: "Syrian",
    flag: "🇸🇾",
    region: "Middle East",
    intro:
      "Travellers from Syria must hold a valid Somalia eVisa before departure. Our specialists guide Syrian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "With frequent direct and connecting flights from the Gulf and wider Middle East, Syrian travellers often visit Somalia for business, trade and family. We prepare your application so it is ready well before your flight.",
  },
  {
    slug: "turkiye",
    country: "Türkiye",
    demonym: "Turkish",
    flag: "🇹🇷",
    region: "Middle East",
    intro:
      "Turkish citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Türkiye, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "We regularly help members of the Somali community in Türkiye travelling home to visit family, as well as Turkish business, humanitarian and tourist travellers.",
  },
  {
    slug: "united-arab-emirates",
    country: "United Arab Emirates",
    demonym: "Emirati",
    flag: "🇦🇪",
    region: "Middle East",
    intro:
      "If you hold an Emirati passport, you need an approved eVisa to visit Somalia. We help applicants from United Arab Emirates prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "We regularly help members of the Somali community in United Arab Emirates travelling home to visit family, as well as Emirati business, humanitarian and tourist travellers.",
  },
  {
    slug: "yemen",
    country: "Yemen",
    demonym: "Yemeni",
    flag: "🇾🇪",
    region: "Middle East",
    intro:
      "Yemeni passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Yemen complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "We regularly help members of the Somali community in Yemen travelling home to visit family, as well as Yemeni business, humanitarian and tourist travellers.",
  },
  {
    slug: "afghanistan",
    country: "Afghanistan",
    demonym: "Afghan",
    flag: "🇦🇫",
    region: "Asia",
    intro:
      "Travellers from Afghanistan must hold a valid Somalia eVisa before departure. Our specialists guide Afghan citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Afghan visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Afghanistan.",
  },
  {
    slug: "armenia",
    country: "Armenia",
    demonym: "Armenian",
    flag: "🇦🇲",
    region: "Asia",
    intro:
      "Armenian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Armenia, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Armenian visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Armenia.",
  },
  {
    slug: "azerbaijan",
    country: "Azerbaijan",
    demonym: "Azerbaijani",
    flag: "🇦🇿",
    region: "Asia",
    intro:
      "If you hold an Azerbaijani passport, you need an approved eVisa to visit Somalia. We help applicants from Azerbaijan prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Azerbaijani visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Azerbaijan.",
  },
  {
    slug: "bangladesh",
    country: "Bangladesh",
    demonym: "Bangladeshi",
    flag: "🇧🇩",
    region: "Asia",
    intro:
      "Bangladeshi passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Bangladesh complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Bangladeshi visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Bangladesh.",
  },
  {
    slug: "bhutan",
    country: "Bhutan",
    demonym: "Bhutanese",
    flag: "🇧🇹",
    region: "Asia",
    intro:
      "Travellers from Bhutan must hold a valid Somalia eVisa before departure. Our specialists guide Bhutanese citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Bhutanese visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Bhutan.",
  },
  {
    slug: "brunei",
    country: "Brunei",
    demonym: "Bruneian",
    flag: "🇧🇳",
    region: "Asia",
    intro:
      "Bruneian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Brunei, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Bruneian visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Brunei.",
  },
  {
    slug: "cambodia",
    country: "Cambodia",
    demonym: "Cambodian",
    flag: "🇰🇭",
    region: "Asia",
    intro:
      "If you hold a Cambodian passport, you need an approved eVisa to visit Somalia. We help applicants from Cambodia prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Cambodian visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Cambodia.",
  },
  {
    slug: "china",
    country: "China",
    demonym: "Chinese",
    flag: "🇨🇳",
    region: "Asia",
    intro:
      "Chinese passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from China complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Chinese visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from China.",
  },
  {
    slug: "georgia",
    country: "Georgia",
    demonym: "Georgian",
    flag: "🇬🇪",
    region: "Asia",
    intro:
      "Travellers from Georgia must hold a valid Somalia eVisa before departure. Our specialists guide Georgian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Georgian visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Georgia.",
  },
  {
    slug: "hong-kong",
    country: "Hong Kong",
    demonym: "Hong Kong",
    flag: "🇭🇰",
    region: "Asia",
    intro:
      "Hong Kong citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Hong Kong, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Hong Kong visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Hong Kong.",
  },
  {
    slug: "india",
    country: "India",
    demonym: "Indian",
    flag: "🇮🇳",
    region: "Asia",
    intro:
      "If you hold an Indian passport, you need an approved eVisa to visit Somalia. We help applicants from India prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Indian visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from India.",
  },
  {
    slug: "indonesia",
    country: "Indonesia",
    demonym: "Indonesian",
    flag: "🇮🇩",
    region: "Asia",
    intro:
      "Indonesian passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Indonesia complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Indonesian visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Indonesia.",
  },
  {
    slug: "japan",
    country: "Japan",
    demonym: "Japanese",
    flag: "🇯🇵",
    region: "Asia",
    intro:
      "Travellers from Japan must hold a valid Somalia eVisa before departure. Our specialists guide Japanese citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Japanese visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Japan.",
  },
  {
    slug: "kazakhstan",
    country: "Kazakhstan",
    demonym: "Kazakhstani",
    flag: "🇰🇿",
    region: "Asia",
    intro:
      "Kazakhstani citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Kazakhstan, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Kazakhstani visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Kazakhstan.",
  },
  {
    slug: "kyrgyzstan",
    country: "Kyrgyzstan",
    demonym: "Kyrgyz",
    flag: "🇰🇬",
    region: "Asia",
    intro:
      "If you hold a Kyrgyz passport, you need an approved eVisa to visit Somalia. We help applicants from Kyrgyzstan prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Kyrgyz visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Kyrgyzstan.",
  },
  {
    slug: "laos",
    country: "Laos",
    demonym: "Lao",
    flag: "🇱🇦",
    region: "Asia",
    intro:
      "Lao passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Laos complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Lao visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Laos.",
  },
  {
    slug: "malaysia",
    country: "Malaysia",
    demonym: "Malaysian",
    flag: "🇲🇾",
    region: "Asia",
    intro:
      "Travellers from Malaysia must hold a valid Somalia eVisa before departure. Our specialists guide Malaysian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "We regularly help members of the Somali community in Malaysia travelling home to visit family, as well as Malaysian business, humanitarian and tourist travellers.",
  },
  {
    slug: "maldives",
    country: "Maldives",
    demonym: "Maldivian",
    flag: "🇲🇻",
    region: "Asia",
    intro:
      "Maldivian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Maldives, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Maldivian visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Maldives.",
  },
  {
    slug: "mongolia",
    country: "Mongolia",
    demonym: "Mongolian",
    flag: "🇲🇳",
    region: "Asia",
    intro:
      "If you hold a Mongolian passport, you need an approved eVisa to visit Somalia. We help applicants from Mongolia prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Mongolian visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Mongolia.",
  },
  {
    slug: "myanmar",
    country: "Myanmar",
    demonym: "Myanmar",
    flag: "🇲🇲",
    region: "Asia",
    intro:
      "Myanmar passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Myanmar complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Myanmar visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Myanmar.",
  },
  {
    slug: "nepal",
    country: "Nepal",
    demonym: "Nepalese",
    flag: "🇳🇵",
    region: "Asia",
    intro:
      "Travellers from Nepal must hold a valid Somalia eVisa before departure. Our specialists guide Nepalese citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Nepalese visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Nepal.",
  },
  {
    slug: "north-korea",
    country: "North Korea",
    demonym: "North Korean",
    flag: "🇰🇵",
    region: "Asia",
    intro:
      "North Korean citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in North Korea, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "North Korean visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from North Korea.",
  },
  {
    slug: "pakistan",
    country: "Pakistan",
    demonym: "Pakistani",
    flag: "🇵🇰",
    region: "Asia",
    intro:
      "If you hold a Pakistani passport, you need an approved eVisa to visit Somalia. We help applicants from Pakistan prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Pakistani visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Pakistan.",
  },
  {
    slug: "philippines",
    country: "Philippines",
    demonym: "Filipino",
    flag: "🇵🇭",
    region: "Asia",
    intro:
      "Filipino passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Philippines complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Filipino visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Philippines.",
  },
  {
    slug: "singapore",
    country: "Singapore",
    demonym: "Singaporean",
    flag: "🇸🇬",
    region: "Asia",
    intro:
      "Travellers from Singapore must hold a valid Somalia eVisa before departure. Our specialists guide Singaporean citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Singaporean visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Singapore.",
  },
  {
    slug: "south-korea",
    country: "South Korea",
    demonym: "South Korean",
    flag: "🇰🇷",
    region: "Asia",
    intro:
      "South Korean citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in South Korea, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "South Korean visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from South Korea.",
  },
  {
    slug: "sri-lanka",
    country: "Sri Lanka",
    demonym: "Sri Lankan",
    flag: "🇱🇰",
    region: "Asia",
    intro:
      "If you hold a Sri Lankan passport, you need an approved eVisa to visit Somalia. We help applicants from Sri Lanka prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Sri Lankan visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Sri Lanka.",
  },
  {
    slug: "taiwan",
    country: "Taiwan",
    demonym: "Taiwanese",
    flag: "🇹🇼",
    region: "Asia",
    intro:
      "Taiwanese passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Taiwan complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Taiwanese visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Taiwan.",
  },
  {
    slug: "tajikistan",
    country: "Tajikistan",
    demonym: "Tajik",
    flag: "🇹🇯",
    region: "Asia",
    intro:
      "Travellers from Tajikistan must hold a valid Somalia eVisa before departure. Our specialists guide Tajik citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Tajik visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Tajikistan.",
  },
  {
    slug: "thailand",
    country: "Thailand",
    demonym: "Thai",
    flag: "🇹🇭",
    region: "Asia",
    intro:
      "Thai citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Thailand, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Thai visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Thailand.",
  },
  {
    slug: "timor-leste",
    country: "Timor-Leste",
    demonym: "Timorese",
    flag: "🇹🇱",
    region: "Asia",
    intro:
      "If you hold a Timorese passport, you need an approved eVisa to visit Somalia. We help applicants from Timor-Leste prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Timorese visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Timor-Leste.",
  },
  {
    slug: "turkmenistan",
    country: "Turkmenistan",
    demonym: "Turkmen",
    flag: "🇹🇲",
    region: "Asia",
    intro:
      "Turkmen passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Turkmenistan complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Turkmen visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Turkmenistan.",
  },
  {
    slug: "uzbekistan",
    country: "Uzbekistan",
    demonym: "Uzbek",
    flag: "🇺🇿",
    region: "Asia",
    intro:
      "Travellers from Uzbekistan must hold a valid Somalia eVisa before departure. Our specialists guide Uzbek citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Uzbek visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Uzbekistan.",
  },
  {
    slug: "vietnam",
    country: "Vietnam",
    demonym: "Vietnamese",
    flag: "🇻🇳",
    region: "Asia",
    intro:
      "Vietnamese citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Vietnam, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Vietnamese visitors usually travel to Somalia via Dubai, Doha, Istanbul or Addis Ababa. We handle the eTAS paperwork for business, investment, humanitarian and tourist trips from Vietnam.",
  },
  {
    slug: "mexico",
    country: "Mexico",
    demonym: "Mexican",
    flag: "🇲🇽",
    region: "North America",
    intro:
      "If you hold a Mexican passport, you need an approved eVisa to visit Somalia. We help applicants from Mexico prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travellers from Mexico typically connect through Europe, the Gulf or East Africa. We review your documents before submission so your eVisa is approved in good time for your trip.",
  },
  {
    slug: "antigua-and-barbuda",
    country: "Antigua and Barbuda",
    demonym: "Antiguan",
    flag: "🇦🇬",
    region: "Central America & Caribbean",
    intro:
      "Antiguan passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Antigua and Barbuda complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travellers from Antigua and Barbuda usually reach Somalia through connecting flights in Europe or the Middle East. We guide Antiguan applicants through every requirement so nothing is missed.",
  },
  {
    slug: "bahamas",
    country: "Bahamas",
    demonym: "Bahamian",
    flag: "🇧🇸",
    region: "Central America & Caribbean",
    intro:
      "Travellers from Bahamas must hold a valid Somalia eVisa before departure. Our specialists guide Bahamian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travellers from Bahamas usually reach Somalia through connecting flights in Europe or the Middle East. We guide Bahamian applicants through every requirement so nothing is missed.",
  },
  {
    slug: "barbados",
    country: "Barbados",
    demonym: "Barbadian",
    flag: "🇧🇧",
    region: "Central America & Caribbean",
    intro:
      "Barbadian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Barbados, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travellers from Barbados usually reach Somalia through connecting flights in Europe or the Middle East. We guide Barbadian applicants through every requirement so nothing is missed.",
  },
  {
    slug: "belize",
    country: "Belize",
    demonym: "Belizean",
    flag: "🇧🇿",
    region: "Central America & Caribbean",
    intro:
      "If you hold a Belizean passport, you need an approved eVisa to visit Somalia. We help applicants from Belize prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travellers from Belize usually reach Somalia through connecting flights in Europe or the Middle East. We guide Belizean applicants through every requirement so nothing is missed.",
  },
  {
    slug: "costa-rica",
    country: "Costa Rica",
    demonym: "Costa Rican",
    flag: "🇨🇷",
    region: "Central America & Caribbean",
    intro:
      "Costa Rican passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Costa Rica complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travellers from Costa Rica usually reach Somalia through connecting flights in Europe or the Middle East. We guide Costa Rican applicants through every requirement so nothing is missed.",
  },
  {
    slug: "cuba",
    country: "Cuba",
    demonym: "Cuban",
    flag: "🇨🇺",
    region: "Central America & Caribbean",
    intro:
      "Travellers from Cuba must hold a valid Somalia eVisa before departure. Our specialists guide Cuban citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travellers from Cuba usually reach Somalia through connecting flights in Europe or the Middle East. We guide Cuban applicants through every requirement so nothing is missed.",
  },
  {
    slug: "dominica",
    country: "Dominica",
    demonym: "Dominican (Dominica)",
    flag: "🇩🇲",
    region: "Central America & Caribbean",
    intro:
      "Dominican (Dominica) citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Dominica, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travellers from Dominica usually reach Somalia through connecting flights in Europe or the Middle East. We guide Dominican (Dominica) applicants through every requirement so nothing is missed.",
  },
  {
    slug: "dominican-republic",
    country: "Dominican Republic",
    demonym: "Dominican",
    flag: "🇩🇴",
    region: "Central America & Caribbean",
    intro:
      "If you hold a Dominican passport, you need an approved eVisa to visit Somalia. We help applicants from Dominican Republic prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travellers from Dominican Republic usually reach Somalia through connecting flights in Europe or the Middle East. We guide Dominican applicants through every requirement so nothing is missed.",
  },
  {
    slug: "el-salvador",
    country: "El Salvador",
    demonym: "Salvadoran",
    flag: "🇸🇻",
    region: "Central America & Caribbean",
    intro:
      "Salvadoran passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from El Salvador complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travellers from El Salvador usually reach Somalia through connecting flights in Europe or the Middle East. We guide Salvadoran applicants through every requirement so nothing is missed.",
  },
  {
    slug: "grenada",
    country: "Grenada",
    demonym: "Grenadian",
    flag: "🇬🇩",
    region: "Central America & Caribbean",
    intro:
      "Travellers from Grenada must hold a valid Somalia eVisa before departure. Our specialists guide Grenadian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travellers from Grenada usually reach Somalia through connecting flights in Europe or the Middle East. We guide Grenadian applicants through every requirement so nothing is missed.",
  },
  {
    slug: "guatemala",
    country: "Guatemala",
    demonym: "Guatemalan",
    flag: "🇬🇹",
    region: "Central America & Caribbean",
    intro:
      "Guatemalan citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Guatemala, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travellers from Guatemala usually reach Somalia through connecting flights in Europe or the Middle East. We guide Guatemalan applicants through every requirement so nothing is missed.",
  },
  {
    slug: "haiti",
    country: "Haiti",
    demonym: "Haitian",
    flag: "🇭🇹",
    region: "Central America & Caribbean",
    intro:
      "If you hold a Haitian passport, you need an approved eVisa to visit Somalia. We help applicants from Haiti prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travellers from Haiti usually reach Somalia through connecting flights in Europe or the Middle East. We guide Haitian applicants through every requirement so nothing is missed.",
  },
  {
    slug: "honduras",
    country: "Honduras",
    demonym: "Honduran",
    flag: "🇭🇳",
    region: "Central America & Caribbean",
    intro:
      "Honduran passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Honduras complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travellers from Honduras usually reach Somalia through connecting flights in Europe or the Middle East. We guide Honduran applicants through every requirement so nothing is missed.",
  },
  {
    slug: "jamaica",
    country: "Jamaica",
    demonym: "Jamaican",
    flag: "🇯🇲",
    region: "Central America & Caribbean",
    intro:
      "Travellers from Jamaica must hold a valid Somalia eVisa before departure. Our specialists guide Jamaican citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travellers from Jamaica usually reach Somalia through connecting flights in Europe or the Middle East. We guide Jamaican applicants through every requirement so nothing is missed.",
  },
  {
    slug: "nicaragua",
    country: "Nicaragua",
    demonym: "Nicaraguan",
    flag: "🇳🇮",
    region: "Central America & Caribbean",
    intro:
      "Nicaraguan citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Nicaragua, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travellers from Nicaragua usually reach Somalia through connecting flights in Europe or the Middle East. We guide Nicaraguan applicants through every requirement so nothing is missed.",
  },
  {
    slug: "panama",
    country: "Panama",
    demonym: "Panamanian",
    flag: "🇵🇦",
    region: "Central America & Caribbean",
    intro:
      "If you hold a Panamanian passport, you need an approved eVisa to visit Somalia. We help applicants from Panama prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travellers from Panama usually reach Somalia through connecting flights in Europe or the Middle East. We guide Panamanian applicants through every requirement so nothing is missed.",
  },
  {
    slug: "saint-kitts-and-nevis",
    country: "Saint Kitts and Nevis",
    demonym: "Kittitian",
    flag: "🇰🇳",
    region: "Central America & Caribbean",
    intro:
      "Kittitian passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Saint Kitts and Nevis complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travellers from Saint Kitts and Nevis usually reach Somalia through connecting flights in Europe or the Middle East. We guide Kittitian applicants through every requirement so nothing is missed.",
  },
  {
    slug: "saint-lucia",
    country: "Saint Lucia",
    demonym: "Saint Lucian",
    flag: "🇱🇨",
    region: "Central America & Caribbean",
    intro:
      "Travellers from Saint Lucia must hold a valid Somalia eVisa before departure. Our specialists guide Saint Lucian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travellers from Saint Lucia usually reach Somalia through connecting flights in Europe or the Middle East. We guide Saint Lucian applicants through every requirement so nothing is missed.",
  },
  {
    slug: "saint-vincent-and-the-grenadines",
    country: "Saint Vincent and the Grenadines",
    demonym: "Vincentian",
    flag: "🇻🇨",
    region: "Central America & Caribbean",
    intro:
      "Vincentian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Saint Vincent and the Grenadines, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travellers from Saint Vincent and the Grenadines usually reach Somalia through connecting flights in Europe or the Middle East. We guide Vincentian applicants through every requirement so nothing is missed.",
  },
  {
    slug: "trinidad-and-tobago",
    country: "Trinidad and Tobago",
    demonym: "Trinidadian",
    flag: "🇹🇹",
    region: "Central America & Caribbean",
    intro:
      "If you hold a Trinidadian passport, you need an approved eVisa to visit Somalia. We help applicants from Trinidad and Tobago prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travellers from Trinidad and Tobago usually reach Somalia through connecting flights in Europe or the Middle East. We guide Trinidadian applicants through every requirement so nothing is missed.",
  },
  {
    slug: "argentina",
    country: "Argentina",
    demonym: "Argentine",
    flag: "🇦🇷",
    region: "South America",
    intro:
      "Argentine passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Argentina complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Argentine travellers generally fly to Somalia via Europe, the Gulf or Addis Ababa. Our team checks your application end to end so it is approved before your departure.",
  },
  {
    slug: "bolivia",
    country: "Bolivia",
    demonym: "Bolivian",
    flag: "🇧🇴",
    region: "South America",
    intro:
      "Travellers from Bolivia must hold a valid Somalia eVisa before departure. Our specialists guide Bolivian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Bolivian travellers generally fly to Somalia via Europe, the Gulf or Addis Ababa. Our team checks your application end to end so it is approved before your departure.",
  },
  {
    slug: "brazil",
    country: "Brazil",
    demonym: "Brazilian",
    flag: "🇧🇷",
    region: "South America",
    intro:
      "Brazilian citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Brazil, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Brazilian travellers generally fly to Somalia via Europe, the Gulf or Addis Ababa. Our team checks your application end to end so it is approved before your departure.",
  },
  {
    slug: "chile",
    country: "Chile",
    demonym: "Chilean",
    flag: "🇨🇱",
    region: "South America",
    intro:
      "If you hold a Chilean passport, you need an approved eVisa to visit Somalia. We help applicants from Chile prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Chilean travellers generally fly to Somalia via Europe, the Gulf or Addis Ababa. Our team checks your application end to end so it is approved before your departure.",
  },
  {
    slug: "colombia",
    country: "Colombia",
    demonym: "Colombian",
    flag: "🇨🇴",
    region: "South America",
    intro:
      "Colombian passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Colombia complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Colombian travellers generally fly to Somalia via Europe, the Gulf or Addis Ababa. Our team checks your application end to end so it is approved before your departure.",
  },
  {
    slug: "ecuador",
    country: "Ecuador",
    demonym: "Ecuadorian",
    flag: "🇪🇨",
    region: "South America",
    intro:
      "Travellers from Ecuador must hold a valid Somalia eVisa before departure. Our specialists guide Ecuadorian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Ecuadorian travellers generally fly to Somalia via Europe, the Gulf or Addis Ababa. Our team checks your application end to end so it is approved before your departure.",
  },
  {
    slug: "guyana",
    country: "Guyana",
    demonym: "Guyanese",
    flag: "🇬🇾",
    region: "South America",
    intro:
      "Guyanese citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Guyana, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Guyanese travellers generally fly to Somalia via Europe, the Gulf or Addis Ababa. Our team checks your application end to end so it is approved before your departure.",
  },
  {
    slug: "paraguay",
    country: "Paraguay",
    demonym: "Paraguayan",
    flag: "🇵🇾",
    region: "South America",
    intro:
      "If you hold a Paraguayan passport, you need an approved eVisa to visit Somalia. We help applicants from Paraguay prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Paraguayan travellers generally fly to Somalia via Europe, the Gulf or Addis Ababa. Our team checks your application end to end so it is approved before your departure.",
  },
  {
    slug: "peru",
    country: "Peru",
    demonym: "Peruvian",
    flag: "🇵🇪",
    region: "South America",
    intro:
      "Peruvian passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Peru complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Peruvian travellers generally fly to Somalia via Europe, the Gulf or Addis Ababa. Our team checks your application end to end so it is approved before your departure.",
  },
  {
    slug: "suriname",
    country: "Suriname",
    demonym: "Surinamese",
    flag: "🇸🇷",
    region: "South America",
    intro:
      "Travellers from Suriname must hold a valid Somalia eVisa before departure. Our specialists guide Surinamese citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Surinamese travellers generally fly to Somalia via Europe, the Gulf or Addis Ababa. Our team checks your application end to end so it is approved before your departure.",
  },
  {
    slug: "uruguay",
    country: "Uruguay",
    demonym: "Uruguayan",
    flag: "🇺🇾",
    region: "South America",
    intro:
      "Uruguayan citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Uruguay, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Uruguayan travellers generally fly to Somalia via Europe, the Gulf or Addis Ababa. Our team checks your application end to end so it is approved before your departure.",
  },
  {
    slug: "venezuela",
    country: "Venezuela",
    demonym: "Venezuelan",
    flag: "🇻🇪",
    region: "South America",
    intro:
      "If you hold a Venezuelan passport, you need an approved eVisa to visit Somalia. We help applicants from Venezuela prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Venezuelan travellers generally fly to Somalia via Europe, the Gulf or Addis Ababa. Our team checks your application end to end so it is approved before your departure.",
  },
  {
    slug: "australia",
    country: "Australia",
    demonym: "Australian",
    flag: "🇦🇺",
    region: "Oceania",
    intro:
      "Australian passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Australia complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "We regularly help members of the Somali community in Australia travelling home to visit family, as well as Australian business, humanitarian and tourist travellers.",
  },
  {
    slug: "fiji",
    country: "Fiji",
    demonym: "Fijian",
    flag: "🇫🇯",
    region: "Oceania",
    intro:
      "Travellers from Fiji must hold a valid Somalia eVisa before departure. Our specialists guide Fijian citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travellers from Fiji usually connect through the Gulf or Asia on the way to Somalia. Apply early and our specialists will make sure your eVisa is ready before you fly.",
  },
  {
    slug: "kiribati",
    country: "Kiribati",
    demonym: "I-Kiribati",
    flag: "🇰🇮",
    region: "Oceania",
    intro:
      "I-Kiribati citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Kiribati, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travellers from Kiribati usually connect through the Gulf or Asia on the way to Somalia. Apply early and our specialists will make sure your eVisa is ready before you fly.",
  },
  {
    slug: "marshall-islands",
    country: "Marshall Islands",
    demonym: "Marshallese",
    flag: "🇲🇭",
    region: "Oceania",
    intro:
      "If you hold a Marshallese passport, you need an approved eVisa to visit Somalia. We help applicants from Marshall Islands prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travellers from Marshall Islands usually connect through the Gulf or Asia on the way to Somalia. Apply early and our specialists will make sure your eVisa is ready before you fly.",
  },
  {
    slug: "micronesia",
    country: "Micronesia",
    demonym: "Micronesian",
    flag: "🇫🇲",
    region: "Oceania",
    intro:
      "Micronesian passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Micronesia complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travellers from Micronesia usually connect through the Gulf or Asia on the way to Somalia. Apply early and our specialists will make sure your eVisa is ready before you fly.",
  },
  {
    slug: "nauru",
    country: "Nauru",
    demonym: "Nauruan",
    flag: "🇳🇷",
    region: "Oceania",
    intro:
      "Travellers from Nauru must hold a valid Somalia eVisa before departure. Our specialists guide Nauruan citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travellers from Nauru usually connect through the Gulf or Asia on the way to Somalia. Apply early and our specialists will make sure your eVisa is ready before you fly.",
  },
  {
    slug: "new-zealand",
    country: "New Zealand",
    demonym: "New Zealand",
    flag: "🇳🇿",
    region: "Oceania",
    intro:
      "New Zealand citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in New Zealand, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "We regularly help members of the Somali community in New Zealand travelling home to visit family, as well as New Zealand business, humanitarian and tourist travellers.",
  },
  {
    slug: "palau",
    country: "Palau",
    demonym: "Palauan",
    flag: "🇵🇼",
    region: "Oceania",
    intro:
      "If you hold a Palauan passport, you need an approved eVisa to visit Somalia. We help applicants from Palau prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travellers from Palau usually connect through the Gulf or Asia on the way to Somalia. Apply early and our specialists will make sure your eVisa is ready before you fly.",
  },
  {
    slug: "papua-new-guinea",
    country: "Papua New Guinea",
    demonym: "Papua New Guinean",
    flag: "🇵🇬",
    region: "Oceania",
    intro:
      "Papua New Guinean passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Papua New Guinea complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travellers from Papua New Guinea usually connect through the Gulf or Asia on the way to Somalia. Apply early and our specialists will make sure your eVisa is ready before you fly.",
  },
  {
    slug: "samoa",
    country: "Samoa",
    demonym: "Samoan",
    flag: "🇼🇸",
    region: "Oceania",
    intro:
      "Travellers from Samoa must hold a valid Somalia eVisa before departure. Our specialists guide Samoan citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travellers from Samoa usually connect through the Gulf or Asia on the way to Somalia. Apply early and our specialists will make sure your eVisa is ready before you fly.",
  },
  {
    slug: "solomon-islands",
    country: "Solomon Islands",
    demonym: "Solomon Islander",
    flag: "🇸🇧",
    region: "Oceania",
    intro:
      "Solomon Islander citizens require an electronic visa to enter Somalia. eVisaSomali makes the process simple for applicants in Solomon Islands, checking your passport, photo and travel details before anything is submitted.",
    highlight:
      "Travellers from Solomon Islands usually connect through the Gulf or Asia on the way to Somalia. Apply early and our specialists will make sure your eVisa is ready before you fly.",
  },
  {
    slug: "tonga",
    country: "Tonga",
    demonym: "Tongan",
    flag: "🇹🇴",
    region: "Oceania",
    intro:
      "If you hold a Tongan passport, you need an approved eVisa to visit Somalia. We help applicants from Tonga prepare a complete, accurate Somalia eTAS application online in minutes.",
    highlight:
      "Travellers from Tonga usually connect through the Gulf or Asia on the way to Somalia. Apply early and our specialists will make sure your eVisa is ready before you fly.",
  },
  {
    slug: "tuvalu",
    country: "Tuvalu",
    demonym: "Tuvaluan",
    flag: "🇹🇻",
    region: "Oceania",
    intro:
      "Tuvaluan passport holders need an approved eVisa before travelling to Somalia. eVisaSomali helps applicants from Tuvalu complete the official Somalia eTAS application accurately, with specialist review before submission.",
    highlight:
      "Travellers from Tuvalu usually connect through the Gulf or Asia on the way to Somalia. Apply early and our specialists will make sure your eVisa is ready before you fly.",
  },
  {
    slug: "vanuatu",
    country: "Vanuatu",
    demonym: "Ni-Vanuatu",
    flag: "🇻🇺",
    region: "Oceania",
    intro:
      "Travellers from Vanuatu must hold a valid Somalia eVisa before departure. Our specialists guide Ni-Vanuatu citizens through every step of the eTAS process, from document checks to final submission.",
    highlight:
      "Travellers from Vanuatu usually connect through the Gulf or Asia on the way to Somalia. Apply early and our specialists will make sure your eVisa is ready before you fly.",
  },
];

/** All countries, alphabetical by name. */
export const visaCountriesSorted = [...visaCountries].sort((a, b) => a.country.localeCompare(b.country));

export const popularVisaCountries = visaCountries.filter((c) => c.popular);

export const visaCountriesByRegion = VISA_REGIONS.map((region) => ({
  region,
  countries: visaCountriesSorted.filter((c) => c.region === region),
})).filter((g) => g.countries.length > 0);
