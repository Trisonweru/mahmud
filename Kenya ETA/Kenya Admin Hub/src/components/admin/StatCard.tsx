import type { LucideIcon } from "lucide-react";

export type StatTone = "default" | "gold" | "success" | "info" | "teal" | "destructive";

interface Props {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: StatTone;
}

const toneConfig: Record<StatTone, {
  bar: string;
  iconBg: string;
  valueColor: string;
}> = {
  default: {
    bar: "bg-gradient-navy",
    iconBg: "bg-primary/10 text-primary",
    valueColor: "text-foreground",
  },
  gold: {
    bar: "bg-gradient-gold",
    iconBg: "bg-gradient-gold text-primary shadow-gold",
    valueColor: "text-foreground",
  },
  success: {
    bar: "bg-gradient-emerald",
    iconBg: "bg-success/15 text-success",
    valueColor: "text-success",
  },
  info: {
    bar: "bg-gradient-blue",
    iconBg: "bg-info/10 text-info",
    valueColor: "text-info",
  },
  teal: {
    bar: "bg-gradient-teal",
    iconBg: "bg-teal/10 text-teal",
    valueColor: "text-teal",
  },
  destructive: {
    bar: "bg-destructive",
    iconBg: "bg-destructive/10 text-destructive",
    valueColor: "text-destructive",
  },
};

export function StatCard({ label, value, delta, icon: Icon, tone = "default" }: Props) {
  const { bar, iconBg, valueColor } = toneConfig[tone];
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-card">
      <div className={`h-1 w-full ${bar}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {label}
            </div>
            <div className={`mt-2.5 font-serif text-3xl font-semibold leading-none ${valueColor}`}>
              {value}
            </div>
            {delta && (
              <div className="mt-2 text-[11px] text-muted-foreground">{delta}</div>
            )}
          </div>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
