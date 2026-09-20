export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Splits on blank lines into paragraph blocks; a single newline becomes a soft break. */
export function buildParagraphBlocks(body: string): string {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs
    .map((paragraph) => {
      const escaped = escapeHtml(paragraph).replace(/\n/g, "<br>");
      return `<!-- wp:paragraph -->\n<p>${escaped}</p>\n<!-- /wp:paragraph -->`;
    })
    .join("\n\n");
}

export interface BlockImage {
  url: string;
  mediaId: number;
  alt: string;
  caption: string;
}

export function buildImageBlock(image: BlockImage): string {
  const figcaption = image.caption
    ? `<figcaption class="wp-element-caption">${escapeHtml(image.caption)}</figcaption>`
    : "";
  return (
    `<!-- wp:image {"id":${image.mediaId},"sizeSlug":"large"} -->\n` +
    `<figure class="wp-block-image size-large">` +
    `<img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt)}" class="wp-image-${image.mediaId}"/>` +
    `${figcaption}</figure>\n<!-- /wp:image -->`
  );
}

/** Builds Gutenberg block markup for the WordPress `content` field, in image order. */
export function buildArticleContent(
  body: string,
  images: BlockImage[],
): string {
  const blocks = [
    buildParagraphBlocks(body),
    ...images.map(buildImageBlock),
  ].filter(Boolean);
  return blocks.join("\n\n");
}
