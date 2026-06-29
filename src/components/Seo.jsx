import { Helmet } from "react-helmet-async";

const BASE = "https://paneloef.lovable.app";

export default function Seo({ title, description, path = "/", image }) {
  const url = BASE + path;
  const fullTitle = title ? `${title} — The British Manor` : "The British Manor — Premium Wall Panels";
  const desc = description || "Premium acoustic and decorative wall panels for modern UK interiors. Fast UK delivery.";
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}
