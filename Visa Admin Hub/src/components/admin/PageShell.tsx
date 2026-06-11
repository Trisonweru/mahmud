interface Props {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className }: Props) {
  return (
    <div className={`mx-auto w-full max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 ${className ?? ""}`}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  meta?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, action, meta }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && <div className="text-[10px] uppercase tracking-[0.22em] text-accent">{eyebrow}</div>}
        <h1 className="mt-1 font-serif text-4xl text-foreground">{title}</h1>
        <div className="gold-divider mt-3" />
        {meta && <div className="mt-2 text-sm text-muted-foreground">{meta}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
