import { Parser } from "htmlparser2";

/** Imported static icons may render; active SVG documents remain downloads. */
export function isSafeSvg(bytes: Uint8Array): boolean {
  if (bytes.length > 10 * 1024 * 1024) return false;
  const text = new TextDecoder().decode(bytes);
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) return false;
  const tags = new Set([
    "svg",
    "g",
    "path",
    "rect",
    "circle",
    "ellipse",
    "line",
    "polyline",
    "polygon",
    "title",
    "desc",
    "defs",
    "clippath",
    "mask",
    "lineargradient",
    "radialgradient",
    "stop",
    "text",
    "tspan",
  ]);
  let valid = true;
  let root = false;
  const parser = new Parser(
    {
      onopentag(name, attributes) {
        if (!root) {
          if (name.toLowerCase() !== "svg") valid = false;
          root = true;
        }
        if (!tags.has(name.toLowerCase())) valid = false;
        for (const [key, value] of Object.entries(attributes)) {
          if (/^on/i.test(key) || /^(?:href|xlink:href|src)$/i.test(key))
            valid = false;
          if (/javascript\s*:|expression\s*\(|@import/i.test(value))
            valid = false;
          for (const match of value.matchAll(/url\s*\((.*?)\)/gi))
            if (!/^\s*["']?#[a-zA-Z0-9_-]+["']?\s*$/.test(match[1]))
              valid = false;
        }
      },
    },
    { xmlMode: true, decodeEntities: true },
  );
  parser.end(text);
  return root && valid;
}
