import sanitizeHtml from "sanitize-html";
import { decodeHTML } from "entities";
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "em",
      "strong",
      "a",
      "h2",
      "h3",
      "h4",
      "figure",
      "figcaption",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "rel"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitizeHtml.simpleTransform(
        "a",
        { rel: "noopener noreferrer" },
        true,
      ),
    },
    exclusiveFilter: (frame) =>
      frame.tag === "img" &&
      !/^\/media\/[a-zA-Z0-9/_%.\-]+$/.test(frame.attribs.src ?? ""),
  });
}
export function sanitizeToPlainText(html: string): string {
  return decodeHTML(
    sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }),
  )
    .replace(/\s+/g, " ")
    .trim();
}
