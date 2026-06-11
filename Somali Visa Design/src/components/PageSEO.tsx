import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description: string;
  canonical: string;
  jsonLd?: object | object[];
}

export const PageSEO = ({ title, description, canonical, jsonLd }: Props) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {jsonLd && (
      <script type="application/ld+json">
        {JSON.stringify(Array.isArray(jsonLd) ? { "@context": "https://schema.org", "@graph": jsonLd } : jsonLd)}
      </script>
    )}
  </Helmet>
);
