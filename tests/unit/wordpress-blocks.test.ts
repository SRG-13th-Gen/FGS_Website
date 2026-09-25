import { describe, expect, it } from "vitest";

import {
  buildArticleContent,
  buildImageBlock,
  buildParagraphBlocks,
  escapeHtml,
} from "@/lib/wordpress/blocks";

describe("escapeHtml", () => {
  it("escapes html-significant characters", () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'quote'`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;quote&#39;",
    );
  });
});

describe("buildParagraphBlocks", () => {
  it("splits on blank lines into separate paragraph blocks", () => {
    const result = buildParagraphBlocks(
      "First paragraph.\n\nSecond paragraph.",
    );
    expect(result).toContain("<p>First paragraph.</p>");
    expect(result).toContain("<p>Second paragraph.</p>");
    expect(result.match(/<!-- wp:paragraph -->/g)).toHaveLength(2);
  });

  it("converts a single newline within a paragraph to a soft break", () => {
    const result = buildParagraphBlocks("Line one.\nLine two.");
    expect(result).toContain("<p>Line one.<br>Line two.</p>");
  });

  it("escapes user content", () => {
    const result = buildParagraphBlocks('<b>bold</b> & "quotes"');
    expect(result).toContain(
      "&lt;b&gt;bold&lt;/b&gt; &amp; &quot;quotes&quot;",
    );
    expect(result).not.toContain("<b>bold</b>");
  });

  it("drops blank paragraphs from extra whitespace", () => {
    const result = buildParagraphBlocks("\n\n   \n\nReal paragraph.\n\n\n");
    expect(result.match(/<!-- wp:paragraph -->/g)).toHaveLength(1);
  });
});

describe("buildImageBlock", () => {
  it("includes the src, alt text, media id class, and a caption", () => {
    const html = buildImageBlock({
      url: "https://cms.test/img.jpg",
      mediaId: 42,
      alt: "A school event",
      caption: "Students on stage",
    });
    expect(html).toContain('src="https://cms.test/img.jpg"');
    expect(html).toContain('alt="A school event"');
    expect(html).toContain("wp-image-42");
    expect(html).toContain("<figcaption");
    expect(html).toContain("Students on stage");
  });

  it("omits figcaption when there is no caption", () => {
    const html = buildImageBlock({
      url: "https://cms.test/img.jpg",
      mediaId: 1,
      alt: "Alt",
      caption: "",
    });
    expect(html).not.toContain("<figcaption");
  });

  it("escapes caption and alt text", () => {
    const html = buildImageBlock({
      url: "https://cms.test/img.jpg",
      mediaId: 1,
      alt: '"><script>',
      caption: "<b>caption</b>",
    });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>caption</b>");
  });
});

describe("buildArticleContent", () => {
  it("orders paragraph blocks before image blocks, images in input order", () => {
    const content = buildArticleContent("Body text.", [
      { url: "https://cms.test/1.jpg", mediaId: 1, alt: "One", caption: "" },
      { url: "https://cms.test/2.jpg", mediaId: 2, alt: "Two", caption: "" },
    ]);
    const paragraphIndex = content.indexOf("Body text.");
    const image1Index = content.indexOf("wp-image-1");
    const image2Index = content.indexOf("wp-image-2");
    expect(paragraphIndex).toBeGreaterThanOrEqual(0);
    expect(paragraphIndex).toBeLessThan(image1Index);
    expect(image1Index).toBeLessThan(image2Index);
  });

  it("produces only image blocks when the body is empty", () => {
    const content = buildArticleContent("   ", [
      { url: "https://cms.test/1.jpg", mediaId: 1, alt: "One", caption: "" },
    ]);
    expect(content).not.toContain("wp:paragraph");
    expect(content).toContain("wp-image-1");
  });
});
