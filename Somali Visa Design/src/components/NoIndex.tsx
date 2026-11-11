import { Helmet } from "react-helmet-async";

// For transactional pages (form steps, checkout) that should never appear in search results.
export const NoIndex = () => (
  <Helmet>
    <meta name="robots" content="noindex" />
  </Helmet>
);
