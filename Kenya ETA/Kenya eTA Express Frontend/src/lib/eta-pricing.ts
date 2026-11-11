export const PRICING = {
  totalFee: 70,
  currency: "USD",
} as const;

export const TOTAL_FEE = PRICING.totalFee;

/** Express handling: decision returned within 5-6 hours during working hours. */
export const EXPRESS_FEE = 150;

/** Transit eTA: reduced fee for travellers passing through Kenya. */
export const TRANSIT_FEE = 50;

/** Official standard processing time. */
export const STANDARD_TIME = "within 3 business days";
export const EXPRESS_HOURS = "5-6 hours during working hours";

export const money = (amount: number) => `$${amount.toFixed(2)}`;

export const NATIONALITIES = [
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "New Zealand",
  "Ireland",
  "Germany",
  "France",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Italy",
  "Spain",
  "Portugal",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Czech Republic",
  "Greece",
  "Turkey",
  "India",
  "Pakistan",
  "Bangladesh",
  "China",
  "Japan",
  "South Korea",
  "Singapore",
  "Malaysia",
  "Philippines",
  "Indonesia",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Israel",
  "Egypt",
  "Nigeria",
  "Ghana",
  "South Africa",
  "Brazil",
  "Argentina",
  "Chile",
  "Mexico",
  "Russia",
  "Ukraine",
  "Other",
];

export const TRAVEL_PURPOSES = ["Tourism", "Friends and Family", "Transit"] as const;
export type TravelPurpose = (typeof TRAVEL_PURPOSES)[number];

export const MARITAL_STATUSES = [
  "Single",
  "Married",
  "Separated",
  "Divorced",
  "Widowed",
] as const;

/** Supporting documents required for each reason for travel. */
/** Base fee payable per applicant for each reason for travel. */
export const purposeFee = (purpose: TravelPurpose) =>
  purpose === "Transit" ? TRANSIT_FEE : TOTAL_FEE;

export const PURPOSE_DOCUMENTS: Record<TravelPurpose, { key: string; label: string; guidance: string[] }[]> = {
  Tourism: [
    {
      key: "accommodationBooking",
      label: "Accommodation booking",
      guidance: ["Hotel or lodge confirmation", "Shows your name and dates", "PDF, JPG or PNG"],
    },
    {
      key: "airlineBooking",
      label: "Airline booking",
      guidance: ["Return or onward ticket", "Shows your travel dates", "PDF, JPG or PNG"],
    },
  ],
  "Friends and Family": [
    {
      key: "invitationLetter",
      label: "Invitation letter",
      guidance: ["Signed letter from your host", "Includes their address and phone number", "PDF, JPG or PNG"],
    },
    {
      key: "hostIdentityCard",
      label: "Identity card of host",
      guidance: ["Kenyan national ID, passport or alien card", "Both sides if using an ID card", "PDF, JPG or PNG"],
    },
    {
      key: "accommodationBooking",
      label: "Accommodation booking",
      guidance: ["Host address confirmation or hotel booking", "Shows your name and dates", "PDF, JPG or PNG"],
    },
    {
      key: "airlineBooking",
      label: "Airline booking",
      guidance: ["Return or onward ticket", "Shows your travel dates", "PDF, JPG or PNG"],
    },
  ],
  Transit: [
    {
      key: "airlineBooking",
      label: "Flight booking confirmation",
      guidance: ["Onward flight out of Kenya", "Shows your name and dates", "PDF, JPG or PNG"],
    },
  ],
};
