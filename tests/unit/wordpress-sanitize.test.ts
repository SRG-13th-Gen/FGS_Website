import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  sanitizeArticleHtml,
  sanitizeToPlainText,
} from "@/lib/wordpress/sanitize";

beforeEach(() => {
  vi.stubEnv("WORDPRESS_URL", "http://localhost:8080");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sanitizeArticleHtml", () => {
  it("keeps allowed tags: paragraphs, emphasis, headings, lists", () => {
    const html =
      "<p>Hello <strong>world</strong> and <em>friends</em>.</p><h2>Heading</h2><ul><li>Item</li></ul>";
    const result = sanitizeArticleHtml(html);
    expect(result).toContain(
      "<p>Hello <strong>world</strong> and <em>friends</em>.</p>",
    );
    expect(result).toContain("<h2>Heading</h2>");
    expect(result).toContain("<li>Item</li>");
  });

  it("strips script tags and event handler attributes", () => {
    const html = `<p onclick="steal()">Hi</p><script>alert(1)</script>`;
    const result = sanitizeArticleHtml(html);
    expect(result).not.toContain("<script");
    expect(result).not.toContain("onclick");
  });

  it("strips javascript: links but keeps the safe schemes", () => {
    const html =
      `<a href="javascript:alert(1)">bad</a>` +
      `<a href="https://example.com">https</a>` +
      `<a href="mailto:a@b.com">mail</a>`;
    const result = sanitizeArticleHtml(html);
    expect(result).not.toContain("javascript:");
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('href="mailto:a@b.com"');
  });

  it("drops images from untrusted origins", () => {
    const html = `<img src="https://evil.test/tracker.png" alt="x">`;
    const result = sanitizeArticleHtml(html);
    expect(result).not.toContain("evil.test");
  });

  it("keeps images from the trusted WordPress origin", () => {
    const html = `<img src="http://localhost:8080/wp-content/uploads/photo.jpg" alt="School event">`;
    const result = sanitizeArticleHtml(html);
    expect(result).toContain(
      "http://localhost:8080/wp-content/uploads/photo.jpg",
    );
  });

  it("removes disallowed tags like iframe and style while keeping safe content", () => {
    const html = `<iframe src="https://evil.test"></iframe><style>body{}</style><p>Safe</p>`;
    const result = sanitizeArticleHtml(html);
    expect(result).not.toContain("iframe");
    expect(result).not.toContain("<style");
    expect(result).toContain("<p>Safe</p>");
  });

  it("preserves figures and figcaptions", () => {
    const html =
      `<figure><img src="http://localhost:8080/wp-content/uploads/a.jpg" alt="A">` +
      `<figcaption>A caption</figcaption></figure>`;
    const result = sanitizeArticleHtml(html);
    expect(result).toContain("<figure>");
    expect(result).toContain("<figcaption>A caption</figcaption>");
  });
});

describe("sanitizeToPlainText", () => {
  it("strips all markup and collapses whitespace", () => {
    const html = `<p>Hello   <strong>world</strong></p>\n<p>Second</p>`;
    expect(sanitizeToPlainText(html)).toBe("Hello world Second");
  });

  it("strips script content entirely, not just the tags", () => {
    const html = `<p>Safe</p><script>alert(1)</script>`;
    expect(sanitizeToPlainText(html)).toBe("Safe");
  });
});
