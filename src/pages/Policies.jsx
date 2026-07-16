import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { policies } from "../data/policies.js";

const CONTACT_PATTERN = /(info@thebritishmanor\.co\.uk|(?:www\.)?thebritishmanor\.co\.uk)/gi;

function RichText({ text }) {
  return text.split(CONTACT_PATTERN).map((part, index) => {
    if (/^info@thebritishmanor\.co\.uk$/i.test(part)) {
      return (
        <a key={`${part}-${index}`} href={`mailto:${part}`}>
          {part}
        </a>
      );
    }

    if (/^(?:www\.)?thebritishmanor\.co\.uk$/i.test(part)) {
      return (
        <a key={`${part}-${index}`} href={`https://${part.replace(/^www\./i, "")}`}>
          {part}
        </a>
      );
    }

    return part;
  });
}

function PolicyBlock({ block, policyId, index }) {
  if (block.type === "list") {
    return (
      <ul className="policy-list">
        {block.items.map((item, itemIndex) => (
          <li key={`${item}-${itemIndex}`}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "heading") {
    const id = `${policyId}-section-${index}`;
    if (block.level === 2) {
      return (
        <h3 id={id} className="policy-section-title">
          {block.text}
        </h3>
      );
    }

    return (
      <h4 id={id} className="policy-subsection-title">
        {block.text}
      </h4>
    );
  }

  if (block.type === "meta") {
    return (
      <p className="policy-meta-line">
        <RichText text={block.text} />
      </p>
    );
  }

  return (
    <p className="policy-paragraph">
      <RichText text={block.text} />
    </p>
  );
}

export default function Policies() {
  const location = useLocation();
  const initialId = location.hash.replace("#", "");
  const [activeId, setActiveId] = useState(
    policies.some((policy) => policy.id === initialId) ? initialId : policies[0].id,
  );

  useEffect(() => {
    const nextId = location.hash.replace("#", "");
    if (policies.some((policy) => policy.id === nextId)) setActiveId(nextId);
  }, [location.hash]);

  const activePolicy = useMemo(
    () => policies.find((policy) => policy.id === activeId) || policies[0],
    [activeId],
  );

  const contents = activePolicy.blocks
    .map((block, index) => ({ ...block, index }))
    .filter((block) => block.type === "heading" && block.level === 2);

  return (
    <div className="policies-page">
      <Seo
        title="Policies"
        description="Privacy, returns, delivery and terms of sale policies for The British Manor."
        path="/policies"
      />

      <header className="policies-hero container">
        <span className="policies-eyebrow">Customer information</span>
        <h1>Policies</h1>
        <p>
          Clear information on how we protect your privacy, fulfil orders, manage returns and set
          the terms for purchases from The British Manor.
        </p>
        <span className="policies-updated">Last updated 14 July 2026</span>
      </header>

      <div className="container policies-shell">
        <nav className="policy-tabs" aria-label="Policy sections">
          {policies.map((policy, index) => {
            const isActive = policy.id === activePolicy.id;
            return (
              <Link
                key={policy.id}
                to={`/policies#${policy.id}`}
                className={`policy-tab ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setActiveId(policy.id)}
              >
                <span className="policy-tab-index">{String(index + 1).padStart(2, "0")}</span>
                <strong>{policy.shortTitle}</strong>
                <span>{policy.summary}</span>
              </Link>
            );
          })}
        </nav>

        <div className="policy-reading-grid">
          <aside className="policy-contents" aria-label={`Contents for ${activePolicy.title}`}>
            <span>On this page</span>
            <ol>
              {contents.map((heading) => (
                <li key={`${heading.text}-${heading.index}`}>
                  <a href={`#${activePolicy.id}-section-${heading.index}`}>{heading.text}</a>
                </li>
              ))}
            </ol>
          </aside>

          <article className="policy-document" id={activePolicy.id}>
            <header className="policy-document-header">
              <span>The British Manor</span>
              <h2>{activePolicy.title}</h2>
              <p>{activePolicy.summary}</p>
            </header>

            <div className="policy-copy">
              {activePolicy.blocks.map((block, index) => (
                <PolicyBlock
                  key={`${activePolicy.id}-${index}`}
                  block={block}
                  policyId={activePolicy.id}
                  index={index}
                />
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
