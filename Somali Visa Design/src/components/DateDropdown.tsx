import { useEffect, useState } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const baseInput =
  "mt-2 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-smooth";

const ErrText = ({ msg }: { msg: string }) => (
  <p className="mt-1 text-xs text-destructive flex items-center gap-1">{msg}</p>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{children}</span>
);

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  minYear: number;
  maxYear: number;
}

function parseDate(value: string) {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) } : null;
}

export function DateDropdown({ label, value, onChange, error, minYear, maxYear }: Props) {
  // Day/month/year are tracked independently so a partial selection (e.g. picking
  // the day before the year is set) is never wiped out — only a *complete* date is
  // ever reported back via onChange. Previously this derived everything straight
  // from `value`, which meant any single-field pick reset the whole control to
  // empty (since two of the three parts were still unset), so a date could never
  // actually be entered from scratch.
  const initial = parseDate(value);
  const [day, setDay] = useState(initial?.day ?? 0);
  const [month, setMonth] = useState(initial?.month ?? 0);
  const [year, setYear] = useState(initial?.year ?? 0);

  // Pick up externally-set complete dates (e.g. autofilled from passport OCR)
  // without disturbing an in-progress selection when the parent clears the value.
  useEffect(() => {
    const parsed = parseDate(value);
    if (parsed && (parsed.day !== day || parsed.month !== month || parsed.year !== year)) {
      setDay(parsed.day);
      setMonth(parsed.month);
      setYear(parsed.year);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const daysInMonth = year && month ? new Date(year, month, 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const update = (next: { day?: number; month?: number; year?: number }) => {
    const y = next.year ?? year;
    const m = next.month ?? month;
    const d = next.day ?? day;
    setYear(y);
    setMonth(m);
    setDay(d);
    if (y && m && d) {
      const safeD = Math.min(d, new Date(y, m, 0).getDate());
      onChange(`${y}-${String(m).padStart(2, "0")}-${String(safeD).padStart(2, "0")}`);
    } else {
      onChange("");
    }
  };

  const sel = `${baseInput} ${error ? "border-destructive" : ""}`;

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 grid grid-cols-[4.5rem_1fr_5.5rem] gap-2.5">
        <select
          aria-label={`${label} — day`}
          value={day || ""}
          onChange={(e) => update({ day: Number(e.target.value) })}
          className={sel}
        >
          <option value="">Day</option>
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          aria-label={`${label} — month`}
          value={month || ""}
          onChange={(e) => update({ month: Number(e.target.value) })}
          className={sel}
        >
          <option value="">Month</option>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select
          aria-label={`${label} — year`}
          value={year || ""}
          onChange={(e) => update({ year: Number(e.target.value) })}
          className={sel}
        >
          <option value="">Year</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {error && <ErrText msg={error} />}
    </div>
  );
}
