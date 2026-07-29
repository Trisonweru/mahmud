// Single source of truth for processing-speed tiers and fees.
// Option 1 (Standard) and Option 2 (Express) are selectable processing speeds for the
// diaspora quick-apply flow. Option 3 is the separate foreigner (Ajnabi) guided form —
// it keeps its own fee below since it isn't a speed choice.

export type ProcessingSpeed = "standard" | "express";

export interface PricingTier {
  option: 1 | 2;
  speed: ProcessingSpeed;
  label: string;
  somaliLabel: string;
  fee: number;
  processingTime: string;
  processingTimeSomali: string;
}

export const PRICING_TIERS: Record<ProcessingSpeed, PricingTier> = {
  standard: {
    option: 1,
    speed: "standard",
    label: "Standard",
    somaliLabel: "Caadi",
    fee: 94,
    processingTime: "24–72 hours",
    processingTimeSomali: "24–72 saacadood",
  },
  express: {
    option: 2,
    speed: "express",
    label: "Express",
    somaliLabel: "Degdeg",
    fee: 150,
    processingTime: "5–6 hours (during Somalia working hours)",
    processingTimeSomali: "5–6 saacadood (xilliga shaqada Soomaaliya)",
  },
};

// Option 3 — foreigner (Ajnabi) guided-form application. Same fee as Standard; kept
// separate because it's a distinct form/process, not a processing-speed choice.
export const AJNABI_OPTION = {
  option: 3 as const,
  fee: 94,
  processingTime: "24–72 hours",
};

export const formatFee = (fee: number) => `$${fee} USD`;
