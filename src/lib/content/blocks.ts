export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
export interface BlockImage {
  url: string;
  mediaId: number;
  alt: string;
  caption: string;
}
function paragraphHtml(text: string): string {
  const pattern =
    /https?:\/\/[^\s<>]+|(?:mailto:|tel:)[^\s<>]+|(?<=\()\/(?!\/)[^\s<>]*/g;
  let html = "";
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    let destination = match[0];
    let depth = 0;
    for (let index = 0; index < destination.length; index++) {
      if (destination[index] === "(") depth++;
      else if (destination[index] === ")") {
        if (depth === 0) {
          destination = destination.slice(0, index);
          break;
        }
        depth--;
      }
    }
    const url = destination.replace(/[.,;!?]+$/, "");
    if (!url || url.includes("\\")) continue;
    html += escapeHtml(text.slice(cursor, match.index));
    html += '<a href="' + escapeHtml(url) + '">' + escapeHtml(url) + "</a>";
    cursor = match.index + url.length;
  }
  return (html + escapeHtml(text.slice(cursor))).replace(/\n/g, "<br>");
}
export function buildParagraphBlocks(body: string): string {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => "<p>" + paragraphHtml(p) + "</p>")
    .join("\n");
}
export function buildImageBlock(image: BlockImage): string {
  return (
    '<figure><img src="' +
    escapeHtml(image.url) +
    '" alt="' +
    escapeHtml(image.alt) +
    '">' +
    (image.caption
      ? "<figcaption>" + escapeHtml(image.caption) + "</figcaption>"
      : "") +
    "</figure>"
  );
}
export function buildArticleContent(
  body: string,
  images: BlockImage[],
): string {
  return [buildParagraphBlocks(body), ...images.map(buildImageBlock)]
    .filter(Boolean)
    .join("\n");
}
