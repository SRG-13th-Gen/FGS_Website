import { Parser } from "htmlparser2";
export interface LegacyImage {
  sourceId: number | null;
  url: string;
  alt: string;
  caption: string;
}
export function normalizeLegacyArticle(raw: string) {
  let text = "";
  let skip = 0;
  let captionDepth = 0;
  let caption = "";
  const images: LegacyImage[] = [];
  const links: string[] = [];
  const stack: string[] = [];
  const parser = new Parser(
    {
      onopentag(name, attributes) {
        stack.push(name);
        if (name === "script" || name === "style") skip++;
        if (skip) return;
        if (name === "figcaption") {
          captionDepth++;
          caption = "";
        }
        if (name === "br") text += "\n";
        if (["p", "h1", "h2", "h3", "h4", "li", "blockquote"].includes(name))
          text += "\n\n";
        if (name === "a") links.push(attributes.href ?? "");
        if (name === "img" && attributes.src) {
          const match = /(?:^|\s)wp-image-(\d+)(?:\s|$)/.exec(
            attributes.class ?? "",
          );
          images.push({
            sourceId: match ? Number(match[1]) : null,
            url: attributes.src,
            alt: attributes.alt ?? "",
            caption: "",
          });
        }
      },
      ontext(value) {
        if (!skip) {
          if (captionDepth) caption += value;
          else text += value;
        }
      },
      onclosetag(name) {
        stack.pop();
        if (name === "script" || name === "style") {
          skip--;
          return;
        }
        if (skip) return;
        if (name === "figcaption") {
          captionDepth--;
          if (images.length) images[images.length - 1].caption = caption.trim();
        }
        if (name === "a") {
          const href = links.pop();
          if (href && /^(https?:\/\/|mailto:|tel:|\/)/i.test(href))
            text += " (" + href + ")";
        }
        if (["p", "h1", "h2", "h3", "h4", "li", "blockquote"].includes(name))
          text += "\n\n";
      },
    },
    { decodeEntities: true },
  );
  parser.end(raw);
  return {
    body: text
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
    images,
  };
}
export function legacyCategory(slug: string): "events" | "announcements" {
  return slug.startsWith("summer-class") || slug === "fgs-22"
    ? "events"
    : "announcements";
}
export function safeSourceUrl(value: string, origins: string[]): URL {
  const url = new URL(value);
  if (
    !origins.includes(url.origin) ||
    url.username ||
    url.password ||
    url.protocol !== "https:"
  )
    throw new Error("Untrusted source URL.");
  return url;
}
