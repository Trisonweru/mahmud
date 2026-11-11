/** Quick-pick buttons that fill a from/to date range (YYYY-MM-DD, local time). */

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function datePresetRanges(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  return [
    { key: "this_month", label: "This month", from: ymd(new Date(y, m, 1)), to: ymd(new Date(y, m + 1, 0)) },
    { key: "last_month", label: "Last month", from: ymd(new Date(y, m - 1, 1)), to: ymd(new Date(y, m, 0)) },
    { key: "this_year", label: "This year", from: ymd(new Date(y, 0, 1)), to: ymd(new Date(y, 11, 31)) },
  ];
}

export function DateRangePresets({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {datePresetRanges().map((p) => {
        const active = from === p.from && to === p.to;
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => (active ? onChange("", "") : onChange(p.from, p.to))}
            aria-pressed={active}
            className={`rounded-sm border px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors ${
              active
                ? "border-accent bg-accent-soft text-foreground"
                : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
