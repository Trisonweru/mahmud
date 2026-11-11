import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description: string;
  canonical: string;
  jsonLd?: object | object[];
}

const MAX_DESCRIPTION = 160;

/**
 * Search results cut meta descriptions at roughly 160 characters. Keep whole
 * sentences that fit; otherwise cut at the last word boundary.
 */
export function metaDescription(text: string, max = MAX_DESCRIPTION): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  let out = "";
  for (const s of sentences) {
    if ((out + s).trim().length > max) break;
    out += s;
  }
  if (out.trim().length >= 70) return out.trim();
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s—-]+$/, "")}…`;
}

export const PageSEO = ({ title, description, canonical, jsonLd }: Props) => {
  const desc = metaDescription(description);
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? { "@context": "https://schema.org", "@graph": jsonLd } : jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
