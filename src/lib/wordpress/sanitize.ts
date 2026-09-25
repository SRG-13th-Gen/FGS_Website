import "server-only";
import sanitizeHtml from "sanitize-html";

import { getWordpressBaseUrl } from "@/lib/wordpress/client";

// Strict allowlist per docs/SECURITY.md: paragraphs, lists, emphasis, links,
// headings, figures, images, captions. Nothing else survives.
const ALLOWED_TAGS = [
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "em",
  "i",
  "strong",
  "b",
  "a",
  "h2",
  "h3",
  "h4",
  "figure",
  "figcaption",
  "img",
];

function isTrustedImageSrc(src: string, trustedOrigin: string): boolean {
  try {
    return new URL(src, trustedOrigin).origin === trustedOrigin;
  } catch {
    return false;
  }
}

/** Sanitizes WordPress-rendered post HTML (native edits or our own writes) for public display. */
export function sanitizeArticleHtml(html: string): string {
  const trustedOrigin = new URL(getWordpressBaseUrl()).origin;

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href"],
      img: ["src", "alt", "width", "height"],
    },
    // Defaults already exclude javascript:/data: — being explicit anyway.
    allowedSchemesByTag: { a: ["http", "https", "mailto", "tel"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform(
        "a",
        { rel: "noopener noreferrer", target: "_blank" },
        true,
      ),
    },
    exclusiveFilter: (frame) => {
      if (frame.tag !== "img") return false;
      const src = frame.attribs.src;
      return !src || !isTrustedImageSrc(src, trustedOrigin);
    },
    disallowedTagsMode: "discard",
  });
}

/** Strips all markup for plain-text contexts (card excerpts, metadata descriptions). */
export function sanitizeToPlainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
