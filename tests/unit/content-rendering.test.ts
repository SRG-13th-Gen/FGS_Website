import { describe, expect, it } from "vitest";
import { buildArticleContent } from "@/lib/content/blocks";
import {
  sanitizeArticleHtml,
  sanitizeToPlainText,
} from "@/lib/content/sanitize";
import { safeMediaPath, searchPattern, pageNumber } from "@/lib/content/media";
import {
  normalizeLegacyArticle,
  legacyCategory,
  safeSourceUrl,
} from "../../scripts/migration/normalize";
describe("content rendering and migration", () => {
  it("escapes article text and captions", () => {
    const result = buildArticleContent("<script>attack</script>", [
      {
        mediaId: 1,
        url: "/media/a.png",
        alt: '" alt',
        caption: "<b>caption</b>",
      },
    ]);
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;b&gt;");
    expect(result).not.toContain("wp:");
  });
  it("keeps safe imported destinations clickable while escaping text", () => {
    const html = sanitizeArticleHtml(
      buildArticleContent(
        "Visit <school> (https://example.org/?a=1&b=2) and story (/news/old-story).",
        [],
      ),
    );
    expect(html).toContain('href="https://example.org/?a=1&amp;b=2"');
    expect(html).toContain('href="/news/old-story"');
    expect(html).toContain("&lt;school&gt;");
  });
  it("excludes scripts, handlers, and foreign images", () => {
    const html = sanitizeArticleHtml(
      '<script>bad()</script><img src="https://evil.test/a.jpg" onerror="bad()"><img src="/media/a.jpg" onload="bad()"><a href="javascript:bad()">text</a>',
    );
    expect(html).not.toContain("script");
    expect(html).not.toContain("evil");
    expect(html).not.toContain("onload");
    expect(html).not.toContain("javascript:");
    expect(html).toContain("/media/a.jpg");
  });
  it("decodes plain text without returning markup", () =>
    expect(sanitizeToPlainText("<b>School &amp; Parents</b>")).toBe(
      "School & Parents",
    ));
  it("normalizes nested galleries and cover text without dropping photos", () => {
    const result = normalizeLegacyArticle(
      '<!-- wp:cover --><div><img class="wp-image-3" src="https://school.test/a.jpg"><p>Foundation <strong>Day</strong></p></div><!-- /wp:cover --><figure><img class="wp-image-4" src="https://school.test/b.jpg"><figcaption>Friends &amp; family</figcaption></figure>',
    );
    expect(result.body).toBe("Foundation Day");
    expect(result.images.map((i) => i.sourceId)).toEqual([3, 4]);
    expect(result.images[1].caption).toBe("Friends & family");
  });
  it("preserves link destinations and rejects injected script text", () => {
    const result = normalizeLegacyArticle(
      '<p>Visit <a href="https://school.test/">school</a>.</p><script>malicious</script>',
    );
    expect(result.body).toContain("https://school.test/");
    expect(result.body).not.toContain("malicious");
  });
  it.each(["summer-class-2025", "summer-class-2025-draft", "fgs-22"])(
    "maps events: %s",
    (slug) => expect(legacyCategory(slug)).toBe("events"),
  );
  it.each(["enrollment", "test-post"])("maps announcements: %s", (slug) =>
    expect(legacyCategory(slug)).toBe("announcements"),
  );
  it.each([
    "http://school.test/a",
    "https://evil.test/a",
    "https://user:password@school.test/a",
  ])("rejects unsafe source: %s", (url) =>
    expect(() => safeSourceUrl(url, ["https://school.test"])).toThrow(
      "Untrusted source URL",
    ),
  );
  it.each([
    ["..", "config"],
    [".", "image"],
    ["folder/image"],
    ["%2e%2e"],
    ["a\\b"],
  ])("rejects media traversal: %s", (...segments) =>
    expect(() => safeMediaPath("C:/media", segments)).toThrow(),
  );
  it("normalizes pagination and treats search wildcards literally", () => {
    expect(pageNumber(-1)).toBe(1);
    expect(pageNumber(Infinity)).toBe(1);
    expect(searchPattern("a%b_")).toBe("%a\\%b\\_%");
  });
});
