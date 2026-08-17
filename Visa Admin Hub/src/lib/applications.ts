import type { Database } from "@/integrations/supabase/types";

export type AppStatus = Database["public"]["Enums"]["application_status"];
export type AppType = Database["public"]["Enums"]["application_type"];
export type DocType = Database["public"]["Enums"]["document_type"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type AppDocument = Database["public"]["Tables"]["application_documents"]["Row"];
export type AppNote = Database["public"]["Tables"]["application_notes"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const statusLabels: Record<AppStatus, string> = {
  pending_payment: "Pending payment",
  awaiting_etas: "Awaiting Confirmation",
  submitted: "Submitted",
  in_review: "In review",
  additional_info: "Info needed",
  approved: "Approved",
  rejected: "Denied",
  refunded: "Refunded",
};

export const CURRENCY_SYMBOL: Record<string, string> = { usd: "$", gbp: "£" };

export function formatMoney(amount: number, currency: string | null | undefined): string {
  const symbol = CURRENCY_SYMBOL[currency ?? "usd"] ?? "$";
  return `${symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

// Fees can be charged in more than one currency (Option 1/3 = GBP, Option 2 = USD),
// so a single summed total is meaningless — group and sum per currency instead.
export function sumByCurrency<T>(items: T[], amountOf: (item: T) => number, currencyOf: (item: T) => string): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const item of items) {
    const currency = currencyOf(item);
    totals[currency] = (totals[currency] ?? 0) + amountOf(item);
  }
  return totals;
}

export function formatCurrencyTotals(totals: Record<string, number>): string {
  const entries = Object.entries(totals);
  if (entries.length === 0) return formatMoney(0, "usd");
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(" + ");
}

export const INFO_SOURCE_NOTE_PREFIX = "info_source:";
export const INFO_SOURCES = {
  internal: "Info Required — Us",
  government: "Info Required — Government",
} as const;
export type InfoSource = keyof typeof INFO_SOURCES;

export const statusTone: Record<AppStatus, string> = {
  pending_payment:  "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
  awaiting_etas:    "bg-warning/15 text-amber-800 ring-1 ring-inset ring-warning/50",
  submitted:        "bg-info/10 text-info ring-1 ring-inset ring-info/40",
  in_review:        "bg-info/10 text-info ring-1 ring-inset ring-info/40",
  additional_info:  "bg-warning/15 text-amber-800 ring-1 ring-inset ring-warning/50",
  approved:         "bg-success/15 text-success ring-1 ring-inset ring-success/40",
  rejected:         "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/40",
  refunded:         "bg-violet-500/10 text-violet-700 ring-1 ring-inset ring-violet-500/40",
};

export const statusDot: Record<AppStatus, string> = {
  pending_payment: "bg-muted-foreground",
  awaiting_etas:   "bg-warning",
  submitted:       "bg-info",
  in_review:       "bg-info",
  additional_info: "bg-warning",
  approved:        "bg-success",
  rejected:        "bg-destructive",
  refunded:        "bg-violet-500",
};

export const docTypeLabels: Record<DocType, string> = {
  passport: "Passport scan",
  photo: "Biometric photo",
  ticket: "Flight ticket",
  sponsor: "Sponsor document",
  other: "Other document",
};

export const notificationLabels: Record<NotificationType, string> = {
  application_submitted: "New application",
  payment_received: "Payment received",
  etas_overdue: "ETAS overdue",
  application_approved: "Application approved",
  application_rejected: "Application rejected",
  note_added: "Note added",
};

// pending_payment is a system-internal state; excluded from manual workflow (#16)
export const ALL_STATUSES: AppStatus[] = [
  "awaiting_etas",
  "submitted",
  "in_review",
  "additional_info",
  "approved",
  "rejected",
];

// Builds a wa.me deep link from a phone number, stripping everything but digits.
export function waLink(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

// True for applications that have been denied or refunded — these never
// proceed to ETAS submission (#16).
export function isRefundedOrDenied(a: Application): boolean {
  return a.status === "rejected" || a.status === "refunded";
}

// Express applications that omit nationality/DOB get auto-generated
// placeholder values at submission time (see routes/api/public/applications.ts
// and payment/initiate.ts). These helpers detect those placeholders so the
// admin UI can show "Not provided — see passport" instead (C1).
const PLACEHOLDER_NATIONALITY = "Somali (Qurba-Joog)";

export function isPlaceholderNationality(a: Application): boolean {
  return a.type === "express" && a.nationality === PLACEHOLDER_NATIONALITY;
}

// The Express (Qurba-Joog) form never collects a real date of birth — the
// save function stamps a fixed placeholder instead. Any express application's
// dob is therefore always a placeholder, regardless of its value.
export function isPlaceholderDob(a: Application): boolean {
  return a.type === "express";
}
