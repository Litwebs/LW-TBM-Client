import { Helmet } from "react-helmet-async";

const BASE = "https://thebritishmanor.co.uk";
const DEFAULT_IMAGE = `${BASE}/images/tbm-logo.png?v=1`;

export default function Seo({
  title,
  description,
  path = "/",
  image,
  type = "website",
  robots = "index,follow",
  jsonLd,
}) {
  const url = BASE + path;
  const fullTitle = title
    ? `${title} — The British Manor`
    : "The British Manor — Premium Wall Panels";
  const desc =
    description ||
    "Luxury furniture, wall panels, lighting and clocks for British interiors. Fast UK delivery from The British Manor.";
  const img = image || DEFAULT_IMAGE;
  const ldArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="The British Manor" />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
}
