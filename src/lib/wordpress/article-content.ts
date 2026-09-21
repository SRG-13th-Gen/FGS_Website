/**
 * Decides whether the simple admin editor can safely round-trip an
 * article's Gutenberg content — parse it apart into a plain-text body and
 * an ordered image list, and regenerate byte-different-but-equivalent
 * block markup on save without losing or reordering anything a native
 * WordPress edit added.
 *
 * The rule (docs/specs/003-team-admin.md#read-only-detection-rule):
 * content.raw must be composed of nothing but top-level `core/paragraph`
 * and `core/image` blocks, every paragraph block plain (no custom
 * attributes, no inline formatting beyond line breaks), every image block
 * exactly the shape buildArticleContent()/buildImageBlock() produce, and
 * every paragraph block ordered before every image block (never
 * interleaved) — because the editor's own save always regenerates content
 * in that same paragraphs-then-images order. Anything else (headings,
 * lists, galleries, embeds, custom HTML, inline formatting, an image
 * block placed between paragraphs, or content with no block markup at
 * all) opens read-only.
 */

export interface ParsedArticleImage {
  mediaId: number;
  url: string;
  alt: string;
  caption: string;
}

export type ArticleContentAnalysis =
  | { editable: true; body: string; images: ParsedArticleImage[] }
  | { editable: false; reason: string };

interface RawBlock {
  name: string;
  attrsJson: string | null;
  innerHtml: string;
}

const OPEN_BLOCK_RE =
  /<!--\s*wp:([a-zA-Z][a-zA-Z0-9/_-]*)\s*(\{[\s\S]*?\})?\s*(\/)?-->/y;

/**
 * Splits raw content into top-level Gutenberg blocks. Returns null when the
 * content isn't entirely block comments (classic/legacy HTML, a malformed
 * block, or anything else outside the block grammar) — that's always unsafe
 * to round-trip.
 */
function parseTopLevelBlocks(raw: string): RawBlock[] | null {
  const blocks: RawBlock[] = [];
  let pos = 0;
  const len = raw.length;

  while (pos < len) {
    const rest = raw.slice(pos);
    const wsMatch = /^\s+/.exec(rest);
    if (wsMatch) {
      pos += wsMatch[0].length;
      continue;
    }
    if (pos >= len) break;

    OPEN_BLOCK_RE.lastIndex = 0;
    const m = OPEN_BLOCK_RE.exec(rest);
    if (!m || m.index !== 0) return null;

    const [full, name, attrsJson, selfClosing] = m;
    pos += full.length;

    if (selfClosing) {
      blocks.push({ name, attrsJson: attrsJson ?? null, innerHtml: "" });
      continue;
    }

    const closer = `<!-- /wp:${name} -->`;
    const closerIndex = raw.indexOf(closer, pos);
    if (closerIndex === -1) return null;

    blocks.push({
      name,
      attrsJson: attrsJson ?? null,
      innerHtml: raw.slice(pos, closerIndex).trim(),
    });
    pos = closerIndex + closer.length;
  }

  return blocks;
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

// A single pass so an already-unescaped replacement (e.g. the "&" produced by
// unescaping "&amp;") is never re-scanned and mistaken for another entity —
// sequential .replace() calls would corrupt text that happens to contain a
// literal entity-like substring, such as "&lt;" typed as plain text.
function unescapeHtml(text: string): string {
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => HTML_ENTITIES[m]);
}

const DISALLOWED_INNER_TAG_RE = /<(?!br\s*\/?>)[^>]*>/i;

function parseParagraphBlock(block: RawBlock): string | null {
  if (block.attrsJson && block.attrsJson.trim() !== "{}") return null;

  const m = /^<p(?:\s[^>]*)?>([\s\S]*)<\/p>$/.exec(block.innerHtml);
  if (!m) return null;

  const inner = m[1];
  if (DISALLOWED_INNER_TAG_RE.test(inner)) return null;

  return unescapeHtml(inner.replace(/<br\s*\/?>/gi, "\n"));
}

// Only the attribute keys buildImageBlock() itself ever writes.
const ALLOWED_IMAGE_ATTR_KEYS = new Set(["id", "sizeSlug"]);

function parseImageBlock(block: RawBlock): ParsedArticleImage | null {
  if (!block.attrsJson) return null;

  let attrs: unknown;
  try {
    attrs = JSON.parse(block.attrsJson);
  } catch {
    return null;
  }
  if (typeof attrs !== "object" || attrs === null) return null;

  const record = attrs as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!ALLOWED_IMAGE_ATTR_KEYS.has(key)) return null;
  }

  const mediaId = record.id;
  if (
    typeof mediaId !== "number" ||
    !Number.isInteger(mediaId) ||
    mediaId <= 0
  ) {
    return null;
  }

  const figureMatch = /^<figure(?:\s[^>]*)?>([\s\S]*)<\/figure>$/.exec(
    block.innerHtml,
  );
  if (!figureMatch) return null;
  const figureInner = figureMatch[1];

  const imgMatch = /<img\s[^>]*>/i.exec(figureInner);
  if (!imgMatch) return null;

  const srcMatch = /\bsrc="([^"]*)"/i.exec(imgMatch[0]);
  if (!srcMatch) return null;
  const altMatch = /\balt="([^"]*)"/i.exec(imgMatch[0]);

  const remainder = (
    figureInner.slice(0, imgMatch.index) +
    figureInner.slice(imgMatch.index + imgMatch[0].length)
  ).trim();

  let caption = "";
  if (remainder) {
    const captionMatch =
      /^<figcaption(?:\s[^>]*)?>([\s\S]*)<\/figcaption>$/.exec(remainder);
    if (!captionMatch) return null;
    const capInner = captionMatch[1];
    if (DISALLOWED_INNER_TAG_RE.test(capInner)) return null;
    caption = unescapeHtml(capInner.replace(/<br\s*\/?>/gi, "\n"));
  }

  return {
    mediaId,
    url: unescapeHtml(srcMatch[1]),
    alt: altMatch ? unescapeHtml(altMatch[1]) : "",
    caption,
  };
}

export function analyzeArticleContent(raw: string): ArticleContentAnalysis {
  const blocks = parseTopLevelBlocks(raw);
  if (blocks === null) {
    return {
      editable: false,
      reason:
        "This article's content isn't made of simple paragraphs and pictures the admin editor understands.",
    };
  }

  const paragraphs: string[] = [];
  const images: ParsedArticleImage[] = [];
  let seenImage = false;

  for (const block of blocks) {
    if (block.name === "paragraph") {
      if (seenImage) {
        return {
          editable: false,
          reason:
            "This article has a picture placed between paragraphs — the admin editor always puts all pictures after the body text, so saving would reorder it.",
        };
      }
      const text = parseParagraphBlock(block);
      if (text === null) {
        return {
          editable: false,
          reason:
            "This article uses paragraph formatting (links, bold or italic text, alignment, etc.) the admin editor can't preserve.",
        };
      }
      paragraphs.push(text);
    } else if (block.name === "image") {
      seenImage = true;
      const image = parseImageBlock(block);
      if (image === null) {
        return {
          editable: false,
          reason:
            "This article has a picture block the admin editor can't preserve (a caption with formatting, a linked image, or a custom layout).",
        };
      }
      images.push(image);
    } else {
      return {
        editable: false,
        reason: `This article uses a "${block.name}" block, which the admin editor doesn't support.`,
      };
    }
  }

  return { editable: true, body: paragraphs.join("\n\n"), images };
}
