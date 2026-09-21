import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getArticleForEdit,
  listArticlesForAdmin,
} from "@/lib/wordpress/admin-articles";
import { buildArticleContent } from "@/lib/wordpress/blocks";

const BASE = "http://localhost:8080";

function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

const CATEGORIES = [
  { id: 4, slug: "announcements", name: "Announcements" },
  { id: 2, slug: "clubs", name: "Clubs" },
  { id: 3, slug: "events", name: "Events" },
];

beforeEach(() => {
  vi.stubEnv("WORDPRESS_URL", BASE);
  vi.stubEnv("WORDPRESS_USERNAME", "user");
  vi.stubEnv("WORDPRESS_APPLICATION_PASSWORD", "pass");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("listArticlesForAdmin", () => {
  it("pushes search, category, and pagination down to the WordPress REST query", async () => {
    let requestedUrl = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        requestedUrl = url;
        return jsonResponse([], 200, {
          "X-WP-Total": "0",
          "X-WP-TotalPages": "0",
        });
      }),
    );

    await listArticlesForAdmin({
      search: "science fair",
      category: "events",
      page: 2,
    });

    expect(requestedUrl).toContain("/posts?");
    expect(requestedUrl).toContain("status=publish");
    expect(requestedUrl).toContain("page=2");
    expect(requestedUrl).toContain("search=science+fair");
    expect(requestedUrl).toContain("categories=3");
  });

  it("does not filter by category when 'all' is requested", async () => {
    let requestedUrl = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        requestedUrl = url;
        return jsonResponse([], 200, {
          "X-WP-Total": "0",
          "X-WP-TotalPages": "0",
        });
      }),
    );

    await listArticlesForAdmin({ search: "", category: "all", page: 1 });
    expect(requestedUrl).not.toContain("categories=");
  });

  it("maps posts, resolves category slugs, and reads pagination headers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (url.includes("/posts?")) {
          return jsonResponse(
            [
              {
                id: 1,
                slug: "post-one",
                status: "publish",
                date_gmt: "2026-09-01T00:00:00",
                title: { rendered: "Post One" },
                categories: [3],
                featured_media: 50,
              },
            ],
            200,
            { "X-WP-Total": "1", "X-WP-TotalPages": "1" },
          );
        }
        if (url.includes("/media/50")) {
          return jsonResponse({
            id: 50,
            source_url: `${BASE}/wp-content/uploads/cover.jpg`,
            alt_text: "Cover alt",
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const result = await listArticlesForAdmin({
      search: "",
      category: "all",
      page: 1,
    });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.items).toEqual([
      {
        id: 1,
        slug: "post-one",
        title: "Post One",
        category: "events",
        publishedAt: "2026-09-01T00:00:00Z",
        status: "publish",
        coverImage: {
          url: `${BASE}/wp-content/uploads/cover.jpg`,
          alt: "Cover alt",
        },
      },
    ]);
  });

  it("returns unavailable when WordPress is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const result = await listArticlesForAdmin({
      search: "",
      category: "all",
      page: 1,
    });
    expect(result.status).toBe("unavailable");
  });
});

describe("getArticleForEdit", () => {
  it("returns editable data for content the simple editor can safely round-trip", async () => {
    const raw = buildArticleContent("Paragraph one.\n\nParagraph two.", [
      {
        url: `${BASE}/wp-content/uploads/inline.jpg`,
        mediaId: 61,
        alt: "Inline",
        caption: "An inline photo",
      },
    ]);

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (url.includes("/posts/42?context=edit")) {
          return jsonResponse({
            id: 42,
            slug: "test-article",
            status: "publish",
            date_gmt: "2026-09-01T00:00:00",
            title: { raw: "Test Article", rendered: "Test Article" },
            content: { raw, rendered: "<p>ignored</p>" },
            categories: [2],
            featured_media: 60,
          });
        }
        if (url.includes("/media/60")) {
          return jsonResponse({
            id: 60,
            source_url: `${BASE}/wp-content/uploads/cover.jpg`,
            alt_text: "Cover",
            caption: { rendered: "Cover caption" },
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const result = await getArticleForEdit(42);
    expect(result.status).toBe("editable");
    if (result.status !== "editable") return;
    expect(result.article.title).toBe("Test Article");
    expect(result.article.category).toBe("clubs");
    expect(result.article.body).toBe("Paragraph one.\n\nParagraph two.");
    expect(result.article.images).toEqual([
      {
        clientId: "cover-60",
        mediaId: 60,
        url: `${BASE}/wp-content/uploads/cover.jpg`,
        alt: "Cover",
        caption: "Cover caption",
      },
      {
        clientId: "image-61-0",
        mediaId: 61,
        url: `${BASE}/wp-content/uploads/inline.jpg`,
        alt: "Inline",
        caption: "An inline photo",
      },
    ]);
  });

  it("returns readonly with a reason for content the simple editor can't preserve", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (url.includes("/posts/7?context=edit")) {
          return jsonResponse({
            id: 7,
            slug: "native-article",
            status: "publish",
            date_gmt: "2026-09-01T00:00:00",
            title: { raw: "Native Article", rendered: "Native Article" },
            content: {
              raw: "<!-- wp:heading --><h2>A heading</h2><!-- /wp:heading -->",
              rendered: "<h2>A heading</h2>",
            },
            categories: [4],
            featured_media: 0,
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const result = await getArticleForEdit(7);
    expect(result.status).toBe("readonly");
    if (result.status !== "readonly") return;
    expect(result.title).toBe("Native Article");
    expect(result.category).toBe("announcements");
    expect(result.reason).toContain("heading");
  });

  it("returns not-found for a missing post", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        return new Response("Not Found", { status: 404 });
      }),
    );
    const result = await getArticleForEdit(999);
    expect(result.status).toBe("not-found");
  });

  it("returns not-found for a post that is already in the trash", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (url.includes("/posts/8?context=edit")) {
          return jsonResponse({
            id: 8,
            slug: "trashed-article",
            status: "trash",
            date_gmt: "2026-09-01T00:00:00",
            title: { raw: "Trashed", rendered: "Trashed" },
            content: { raw: "", rendered: "" },
            categories: [],
            featured_media: 0,
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );
    const result = await getArticleForEdit(8);
    expect(result.status).toBe("not-found");
  });
});
