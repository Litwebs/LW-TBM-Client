// Lightweight HTML helpers for rendering admin-authored rich text safely.

const ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "UL",
  "OL",
  "LI",
  "BLOCKQUOTE",
  "A",
  "SPAN",
  "DIV",
]);

const ALLOWED_ATTRS = {
  A: ["href", "target", "rel"],
  SPAN: ["style"],
  P: ["style"],
  DIV: ["style"],
  H1: ["style"],
  H2: ["style"],
  H3: ["style"],
  H4: ["style"],
  H5: ["style"],
  H6: ["style"],
  LI: ["style"],
};

function isSafeUrl(url) {
  return !/^\s*(javascript:|data:|vbscript:)/i.test(url || "");
}

/**
 * Sanitize an HTML string to a whitelist of safe tags/attributes.
 * Falls back to escaped plain text if DOMParser is unavailable.
 */
export function sanitizeHtml(input) {
  const raw = String(input || "");
  if (!raw) return "";

  if (typeof window === "undefined" || !window.DOMParser) {
    const div = { textContent: raw };
    return div.textContent;
  }

  const doc = new DOMParser().parseFromString(raw, "text/html");

  const walk = (node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === 1) {
        if (!ALLOWED_TAGS.has(child.tagName)) {
          // Replace disallowed element with its text content.
          child.replaceWith(document.createTextNode(child.textContent || ""));
          continue;
        }

        const allowed = ALLOWED_ATTRS[child.tagName] || [];
        for (const attr of Array.from(child.attributes)) {
          if (!allowed.includes(attr.name.toLowerCase())) {
            child.removeAttribute(attr.name);
          }
        }

        if (child.tagName === "A") {
          const href = child.getAttribute("href");
          if (!isSafeUrl(href)) {
            child.removeAttribute("href");
          } else {
            child.setAttribute("target", "_blank");
            child.setAttribute("rel", "noopener noreferrer");
          }
        }

        walk(child);
      } else if (child.nodeType === 8) {
        child.remove();
      }
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
}

/**
 * Convert HTML (or plain text) to a plain-text string for meta/JSON-LD.
 */
export function htmlToText(input) {
  const raw = String(input || "");
  if (!raw) return "";

  if (typeof window === "undefined" || !window.DOMParser) {
    return raw
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const doc = new DOMParser().parseFromString(raw, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}
