import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { fetchResolvedSeo } from "../lib/api.js";

const BASE = "https://thebritishmanor.co.uk";
const DEFAULT_IMAGE = `${BASE}/images/tbm-logo.png?v=1`;

function toAbsoluteUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${BASE}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function normalizePath(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

export default function Seo({
  title,
  description,
  path,
  image,
  type = "website",
  robots = "index,follow",
  jsonLd,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [resolvedSeo, setResolvedSeo] = useState(null);
  const lastRedirectKeyRef = useRef("");

  const requestedPath = useMemo(() => {
    const fromProp = String(path || "").trim();
    if (fromProp) return fromProp;
    return location.pathname || "/";
  }, [location.pathname, path]);

  useEffect(() => {
    let active = true;

    fetchResolvedSeo(requestedPath)
      .then((payload) => {
        if (!active) return;

        const redirect = payload?.redirect || null;
        if (redirect?.destinationPath) {
          const fromPath = normalizePath(requestedPath);
          const toPath = normalizePath(redirect.destinationPath);

          if (fromPath !== toPath) {
            const redirectKey = `${fromPath}->${toPath}`;
            if (lastRedirectKeyRef.current !== redirectKey) {
              lastRedirectKeyRef.current = redirectKey;
              const destination = `${toPath}${location.search || ""}${location.hash || ""}`;
              const replace = [301, 308].includes(Number(redirect.statusCode));
              navigate(destination, { replace });
            }
            setResolvedSeo(null);
            return;
          }
        }

        lastRedirectKeyRef.current = "";
        setResolvedSeo(payload?.seo || null);
      })
      .catch(() => {
        if (!active) return;
        setResolvedSeo(null);
      });

    return () => {
      active = false;
    };
  }, [location.hash, location.search, navigate, requestedPath]);

  const canonicalUrl = toAbsoluteUrl(resolvedSeo?.canonicalUrl) || `${BASE}${requestedPath}`;
  const fullTitle = resolvedSeo?.title
    ? String(resolvedSeo.title)
    : title
      ? `${title} — The British Manor`
      : "The British Manor — Premium Wall Panels";
  const desc =
    resolvedSeo?.description ||
    description ||
    "Luxury furniture, wall panels, lighting and clocks for British interiors. Fast UK delivery from The British Manor.";
  const img =
    toAbsoluteUrl(resolvedSeo?.openGraph?.image) ||
    toAbsoluteUrl(resolvedSeo?.twitter?.image) ||
    image ||
    DEFAULT_IMAGE;
  const metaRobots = resolvedSeo?.robots || robots;
  const metaType = resolvedSeo?.openGraph?.type || type;

  const ldArray = [
    ...(Array.isArray(resolvedSeo?.structuredDataBlocks)
      ? resolvedSeo.structuredDataBlocks
          .map((block) => block?.json)
          .filter((value) => value && typeof value === "object")
      : []),
    ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []),
  ];

  const customMeta = Array.isArray(resolvedSeo?.customMeta)
    ? resolvedSeo.customMeta.filter((item) => item?.key && item?.value)
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content={metaRobots} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={resolvedSeo?.openGraph?.title || fullTitle} />
      <meta property="og:description" content={resolvedSeo?.openGraph?.description || desc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={metaType} />
      <meta property="og:site_name" content="The British Manor" />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content={resolvedSeo?.twitter?.card || "summary_large_image"} />
      <meta name="twitter:title" content={resolvedSeo?.twitter?.title || fullTitle} />
      <meta name="twitter:description" content={resolvedSeo?.twitter?.description || desc} />
      <meta name="twitter:image" content={img} />
      {customMeta.map((item) => (
        <meta key={item.key} name={item.key} content={item.value} />
      ))}
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
}
