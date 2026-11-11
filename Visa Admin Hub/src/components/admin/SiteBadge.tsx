import { Globe } from "lucide-react";
import { SITES, siteInfo, type SiteFilterValue } from "@/lib/sites";

/** Small label showing which public website an application came from. */
export function SiteBadge({ site, full = false }: { site: string | null | undefined; full?: boolean }) {
  const s = siteInfo(site);
  return (
    <span
      title={`Submitted on ${s.label}`}
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${s.tone}`}
    >
      <Globe className="h-3 w-3" aria-hidden="true" />
      {full ? s.label : s.short}
    </span>
  );
}

/** Website filter dropdown shared by the Applications, Queue, Payments, Customers and Analytics pages. */
export function SiteSelect({
  value,
  onChange,
  className = "rounded-sm border border-input bg-background px-3 py-1.5 text-sm",
}: {
  value: SiteFilterValue;
  onChange: (v: SiteFilterValue) => void;
  className?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as SiteFilterValue)} aria-label="Website" className={className}>
      <option value="all">All websites</option>
      {SITES.map((s) => (
        <option key={s.key} value={s.key}>{s.label}</option>
      ))}
    </select>
  );
}
