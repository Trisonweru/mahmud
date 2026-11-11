import { useState } from "react";

/** Quick date-range filters shared by every date filter in the backend (YYYY-MM-DD, local time). */

export const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export type QuickRangeKey = "last_week" | "last_month" | "last_3_months" | "last_year";

export const QUICK_RANGES: { key: QuickRangeKey; label: string; description: string }[] = [
  { key: "last_week", label: "Last Week", description: "Past 7 days" },
  { key: "last_month", label: "Last Month", description: "Past 30 days" },
  { key: "last_3_months", label: "Last 3 Months", description: "Past 90 days" },
  { key: "last_year", label: "Last One Year", description: "Past 12 months" },
];

/** Inclusive from/to range ending today. */
export function quickRange(key: QuickRangeKey, now = new Date()): { from: string; to: string } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today);
  switch (key) {
    case "last_week": start.setDate(start.getDate() - 6); break;
    case "last_month": start.setDate(start.getDate() - 29); break;
    case "last_3_months": start.setDate(start.getDate() - 89); break;
    case "last_year": start.setFullYear(start.getFullYear() - 1); start.setDate(start.getDate() + 1); break;
  }
  return { from: ymd(start), to: ymd(today) };
}

type Mode = "all" | QuickRangeKey | "custom";

const inputCls = "rounded-sm border border-input bg-background px-2 py-1 text-sm";

/**
 * Dropdown with quick filters (Last Week / Last Month / Last 3 Months / Last One Year)
 * plus the manual Custom Date Range inputs.
 */
export function DateRangeFilter({
  from,
  to,
  onChange,
  allLabel = "All dates",
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  allLabel?: string;
}) {
  const [customChosen, setCustomChosen] = useState(false);
  const matched = QUICK_RANGES.find((r) => {
    const q = quickRange(r.key);
    return q.from === from && q.to === to;
  });
  const mode: Mode = matched && !customChosen ? matched.key : from || to || customChosen ? "custom" : "all";

  const select = (m: Mode) => {
    if (m === "custom") {
      setCustomChosen(true);
      return;
    }
    setCustomChosen(false);
    if (m === "all") onChange("", "");
    else {
      const q = quickRange(m);
      onChange(q.from, q.to);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={mode}
        onChange={(e) => select(e.target.value as Mode)}
        aria-label="Date range"
        className="rounded-sm border border-input bg-background px-3 py-1.5 text-sm"
      >
        <option value="all">{allLabel}</option>
        {QUICK_RANGES.map((r) => (
          <option key={r.key} value={r.key}>
            {r.label} ({r.description})
          </option>
        ))}
        <option value="custom">Custom Date Range</option>
      </select>
      {mode === "custom" && (
        <>
          <input type="date" value={from} max={to || undefined} onChange={(e) => onChange(e.target.value, to)} className={inputCls} />
          <span>to</span>
          <input type="date" value={to} min={from || undefined} onChange={(e) => onChange(from, e.target.value)} className={inputCls} />
        </>
      )}
    </div>
  );
}
