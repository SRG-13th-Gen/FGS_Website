import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getArticleBySlug, getPublishedArticles } from "@/lib/wordpress/reads";

const BASE = "http://localhost:8080";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const CATEGORIES = [
  { id: 4, slug: "announcements", name: "Announcements" },
  { id: 2, slug: "clubs", name: "Clubs" },
  { id: 3, slug: "events", name: "Events" },
  { id: 1, slug: "uncategorized", name: "Uncategorized" },
];

function makePost(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    slug: "test-post",
    status: "publish",
    date_gmt: "2026-09-01T10:00:00",
    title: { rendered: "Test Post" },
    content: { rendered: "<p>Hello <script>alert(1)</script></p>" },
    excerpt: { rendered: "<p>Hello excerpt</p>" },
    categories: [3],
    featured_media: 55,
    ...overrides,
  };
}

beforeEach(() => {
  vi.stubEnv("WORDPRESS_URL", BASE);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getPublishedArticles", () => {
  it("maps posts to articles, resolving categories and cover media", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/categories")) return jsonResponse(CATEGORIES);
      if (url.includes("/media/55")) {
        return jsonResponse({
          id: 55,
          source_url: `${BASE}/wp-content/uploads/photo.jpg`,
          alt_text: "A photo",
          caption: { rendered: "<p>Caption text</p>" },
        });
      }
      if (url.includes("/posts")) return jsonResponse([makePost()]);
      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPublishedArticles();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;

    expect(result.articles).toHaveLength(1);
    const article = result.articles[0];
    expect(article.category).toBe("events");
    expect(article.title).toBe("Test Post");
    expect(article.contentHtml).not.toContain("<script");
    expect(article.coverImage?.url).toBe(
      `${BASE}/wp-content/uploads/photo.jpg`,
    );
    expect(article.coverImage?.caption).toBe("Caption text");
  });

  it("excludes posts that aren't in an allowed category", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/categories")) return jsonResponse(CATEGORIES);
      if (url.includes("/posts"))
        return jsonResponse([makePost({ categories: [1] })]);
      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPublishedArticles();
    expect(result).toEqual({ status: "ok", articles: [] });
  });

  it("gracefully handles missing or deleted cover media", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/categories")) return jsonResponse(CATEGORIES);
      if (url.includes("/media/55"))
        return new Response("Not Found", { status: 404 });
      if (url.includes("/posts")) return jsonResponse([makePost()]);
      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPublishedArticles();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.articles[0].coverImage).toBeNull();
  });

  it("returns unavailable when WordPress cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    expect(await getPublishedArticles()).toEqual({ status: "unavailable" });
  });

  it("returns unavailable when categories cannot be resolved", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/categories"))
          return new Response("error", { status: 500 });
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    expect(await getPublishedArticles()).toEqual({ status: "unavailable" });
  });
});

describe("getArticleBySlug", () => {
  it("returns not-found for an unknown slug", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/categories")) return jsonResponse(CATEGORIES);
      if (url.includes("/posts")) return jsonResponse([]);
      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(await getArticleBySlug("does-not-exist")).toEqual({
      status: "not-found",
    });
  });

  it("returns not-found for a post outside the allowed categories", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/categories")) return jsonResponse(CATEGORIES);
      if (url.includes("/posts"))
        return jsonResponse([makePost({ categories: [1] })]);
      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(await getArticleBySlug("test-post")).toEqual({
      status: "not-found",
    });
  });

  it("returns unavailable when WordPress errors", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/categories")) return jsonResponse(CATEGORIES);
      if (url.includes("/posts")) return new Response("error", { status: 500 });
      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(await getArticleBySlug("some-slug")).toEqual({
      status: "unavailable",
    });
  });
});
