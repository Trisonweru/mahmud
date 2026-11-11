interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** Use "h1" when this is the page's main heading (one per page, for search engines). */
  as?: "h1" | "h2";
}

export const SectionHeading = ({ eyebrow, title, description, align = "center", as: Heading = "h2" }: Props) => (
  <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
    {eyebrow && (
      <div className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
        <span className="gold-divider" />
        <span className="text-xs uppercase tracking-[0.25em] text-accent font-medium">{eyebrow}</span>
        <span className="gold-divider" />
      </div>
    )}
    <Heading className="mt-5 font-serif text-4xl md:text-5xl font-semibold text-primary leading-[1.1]">
      {title}
    </Heading>
    {description && (
      <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">{description}</p>
    )}
  </div>
);
