import { statusLabels, statusTone, statusDot, type AppStatus } from "@/lib/applications";

export function StatusBadge({ status }: { status: AppStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${statusTone[status]}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[status]}`} />
      {statusLabels[status]}
    </span>
  );
}
