import { describe, expect, it } from "vitest";

import { analyzeArticleContent } from "@/lib/wordpress/article-content";
import { buildArticleContent } from "@/lib/wordpress/blocks";

describe("analyzeArticleContent — round-trips our own generated content", () => {
  it("accepts paragraphs with no images", () => {
    const raw = buildArticleContent(
      "First paragraph.\n\nSecond paragraph.",
      [],
    );
    const result = analyzeArticleContent(raw);
    expect(result).toEqual({
      editable: true,
      body: "First paragraph.\n\nSecond paragraph.",
      images: [],
    });
  });

  it("accepts paragraphs followed by images, preserving caption/alt/id", () => {
    const raw = buildArticleContent("Body text.", [
      {
        url: "https://cms.example/a.jpg",
        mediaId: 5,
        alt: "Photo A",
        caption: "Caption A",
      },
      {
        url: "https://cms.example/b.jpg",
        mediaId: 6,
        alt: "Photo B",
        caption: "",
      },
    ]);
    const result = analyzeArticleContent(raw);
    expect(result).toEqual({
      editable: true,
      body: "Body text.",
      images: [
        {
          mediaId: 5,
          url: "https://cms.example/a.jpg",
          alt: "Photo A",
          caption: "Caption A",
        },
        {
          mediaId: 6,
          url: "https://cms.example/b.jpg",
          alt: "Photo B",
          caption: "",
        },
      ],
    });
  });

  it("accepts a multi-line paragraph (soft <br> line breaks)", () => {
    const raw = buildArticleContent("Line one\nLine two", []);
    const result = analyzeArticleContent(raw);
    expect(result).toEqual({
      editable: true,
      body: "Line one\nLine two",
      images: [],
    });
  });

  it("round-trips text containing HTML-special characters", () => {
    const raw = buildArticleContent('Reading & "Writing" <Week> it\'s fun', []);
    const result = analyzeArticleContent(raw);
    expect(result).toEqual({
      editable: true,
      body: 'Reading & "Writing" <Week> it\'s fun',
      images: [],
    });
  });

  it("accepts only images, no paragraphs", () => {
    const raw = buildArticleContent("", [
      { url: "https://cms.example/a.jpg", mediaId: 1, alt: "A", caption: "" },
    ]);
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(true);
    if (result.editable) {
      expect(result.body).toBe("");
      expect(result.images).toHaveLength(1);
    }
  });

  it("treats empty content as editable with no paragraphs or images", () => {
    const result = analyzeArticleContent("");
    expect(result).toEqual({ editable: true, body: "", images: [] });
  });

  it("treats whitespace-only content as editable and empty", () => {
    const result = analyzeArticleContent("   \n\n  ");
    expect(result).toEqual({ editable: true, body: "", images: [] });
  });
});

describe("analyzeArticleContent — rejects content the simple editor can't preserve", () => {
  it("rejects classic/legacy HTML with no block markup at all", () => {
    const result = analyzeArticleContent(
      "<p>Just plain HTML, no block comments.</p>",
    );
    expect(result.editable).toBe(false);
  });

  it("rejects an unsupported block type (heading)", () => {
    const raw =
      "<!-- wp:heading --><h2>A heading</h2><!-- /wp:heading -->\n\n" +
      "<!-- wp:paragraph -->\n<p>Body.</p>\n<!-- /wp:paragraph -->";
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(false);
    if (!result.editable) expect(result.reason).toContain("heading");
  });

  it("rejects an unsupported block type (list)", () => {
    const raw = "<!-- wp:list -->\n<ul><li>Item</li></ul>\n<!-- /wp:list -->";
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(false);
  });

  it("rejects a picture placed between paragraphs (image before a later paragraph)", () => {
    const raw =
      "<!-- wp:paragraph -->\n<p>First.</p>\n<!-- /wp:paragraph -->\n\n" +
      '<!-- wp:image {"id":1,"sizeSlug":"large"} -->\n<figure class="wp-block-image size-large"><img src="https://cms.example/a.jpg" alt="A" class="wp-image-1"/></figure>\n<!-- /wp:image -->\n\n' +
      "<!-- wp:paragraph -->\n<p>Second.</p>\n<!-- /wp:paragraph -->";
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(false);
    if (!result.editable) expect(result.reason).toContain("between paragraphs");
  });

  it("rejects a paragraph block with custom attributes (e.g. alignment)", () => {
    const raw =
      '<!-- wp:paragraph {"align":"center"} -->\n<p class="has-text-align-center">Centered.</p>\n<!-- /wp:paragraph -->';
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(false);
  });

  it("rejects a paragraph with inline formatting (bold text)", () => {
    const raw =
      "<!-- wp:paragraph -->\n<p>Some <strong>bold</strong> text.</p>\n<!-- /wp:paragraph -->";
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(false);
  });

  it("rejects a paragraph with a link", () => {
    const raw =
      '<!-- wp:paragraph -->\n<p>Visit <a href="https://example.com">our site</a>.</p>\n<!-- /wp:paragraph -->';
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(false);
  });

  it("rejects an image block missing a media id", () => {
    const raw =
      '<!-- wp:image -->\n<figure class="wp-block-image"><img src="https://cms.example/a.jpg" alt="A"/></figure>\n<!-- /wp:image -->';
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(false);
  });

  it("rejects an image block with an unrecognized attribute (e.g. a custom class or link)", () => {
    const raw =
      '<!-- wp:image {"id":1,"linkDestination":"media"} -->\n<figure class="wp-block-image"><a href="https://cms.example/a.jpg"><img src="https://cms.example/a.jpg" alt="A" class="wp-image-1"/></a></figure>\n<!-- /wp:image -->';
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(false);
  });

  it("rejects an image block whose figure wraps the image in a link even without a matching attribute", () => {
    const raw =
      '<!-- wp:image {"id":1,"sizeSlug":"large"} -->\n<figure class="wp-block-image size-large"><a href="https://example.com"><img src="https://cms.example/a.jpg" alt="A" class="wp-image-1"/></a></figure>\n<!-- /wp:image -->';
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(false);
  });

  it("rejects a malformed block with no matching closing comment", () => {
    const raw = "<!-- wp:paragraph -->\n<p>Unclosed.</p>";
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(false);
  });

  it("rejects content with stray text outside any block", () => {
    const raw =
      "<!-- wp:paragraph -->\n<p>Body.</p>\n<!-- /wp:paragraph -->\n\nStray trailing text";
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(false);
  });

  it("rejects a gallery block", () => {
    const raw =
      '<!-- wp:gallery {"ids":[1,2]} -->\n<figure class="wp-block-gallery"></figure>\n<!-- /wp:gallery -->';
    const result = analyzeArticleContent(raw);
    expect(result.editable).toBe(false);
  });
});
