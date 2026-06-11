interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export const SectionHeading = ({ eyebrow, title, description, align = "center" }: Props) => (
  <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
    {eyebrow && (
      <div className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
        <span className="gold-divider" />
        <span className="text-xs uppercase tracking-[0.25em] text-accent font-medium">{eyebrow}</span>
        <span className="gold-divider" />
      </div>
    )}
    <h2 className="mt-5 font-serif text-4xl md:text-5xl font-semibold text-primary leading-[1.1]">
      {title}
    </h2>
    {description && (
      <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">{description}</p>
    )}
  </div>
);
