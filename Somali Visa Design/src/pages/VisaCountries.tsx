import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { PageSEO } from "@/components/PageSEO";
import { visaCountriesByRegion, visaCountriesSorted } from "@/data/visaCountries";
import { SITE } from "@/config/site";
import content from "@site-content";

const vi = content.visaIndex;


const VisaCountries = () => {
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return visaCountriesByRegion;
    return visaCountriesByRegion
      .map((g) => ({
        ...g,
        countries: g.countries.filter(
          (c) => c.country.toLowerCase().includes(term) || c.demonym.toLowerCase().includes(term),
        ),
      }))
      .filter((g) => g.countries.length > 0);
  }, [q]);

  return (
    <>
      <PageSEO
        title={vi.seoTitle}
        description={vi.seoDescription(visaCountriesSorted.length)}
        canonical={`${SITE.url}/visa`}
        jsonLd={[
          {
            "@type": "ItemList",
            name: vi.listName,
            numberOfItems: visaCountriesSorted.length,
            itemListElement: visaCountriesSorted.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: vi.label(c.country),
              url: `${SITE.url}/visa/${c.slug}`,
            })),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
              { "@type": "ListItem", position: 2, name: "Visas by Nationality", item: `${SITE.url}/visa` },
            ],
          },
        ]}
      />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, hsl(var(--accent)/0.5), transparent 50%)" }} />
        <div className="relative container text-center max-w-3xl">
          <span className="text-xs uppercase tracking-[0.25em] text-accent">{vi.eyebrow}</span>
          <h1 className="mt-5 font-serif text-5xl md:text-6xl">{vi.h1}</h1>
          <p className="mt-6 text-primary-foreground/75 text-lg">{vi.intro}</p>
        </div>
      </section>

      <section className="container py-16">
        <p className="mx-auto max-w-3xl rounded-sm border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">{vi.note}</p>

        <div className="mx-auto mt-8 max-w-md">
          <label htmlFor="country-search" className="sr-only">Search your nationality</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="country-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search your country or nationality…"
              className="w-full rounded-sm border border-input bg-background py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {groups.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted-foreground">No country matches “{q}”.</p>
        )}

        {groups.map((g) => (
          <div key={g.region} className="mt-14">
            <h2 className="font-serif text-2xl text-primary">
              {g.region} <span className="text-sm font-sans text-muted-foreground">({g.countries.length})</span>
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.countries.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/visa/${c.slug}`}
                    className="flex items-center justify-between gap-3 rounded-sm border border-border bg-card p-4 shadow-card transition-smooth hover:border-accent/60"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">{c.flag}</span>
                      <span>
                        <span className="block text-sm font-semibold text-foreground">{vi.label(c.country)}</span>
                        <span className="block text-xs text-muted-foreground">{vi.sublabel(c.demonym)}</span>
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
};

export default VisaCountries;
