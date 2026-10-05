import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const reads = vi.hoisted(() => ({ getPublishedArticles: vi.fn() }));
vi.mock("@/lib/content/reads", () => reads);

import sitemap from "@/app/sitemap";

const article = (slug: string) => ({
  slug,
  publishedAt: "2026-10-01T00:00:00Z",
});

describe("sitemap", () => {
  beforeEach(() => {
    vi.stubEnv("SITE_INDEXABLE", "true");
    reads.getPublishedArticles.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("lists the home, alumni and PTA pages", async () => {
    reads.getPublishedArticles.mockResolvedValue({
      status: "ok",
      articles: [],
    });
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toEqual([
      "https://flordegraceschoolinc.com/",
      "https://flordegraceschoolinc.com/alumni",
      "https://flordegraceschoolinc.com/pta",
    ]);
  });

  it("keeps every published article, whatever its category", async () => {
    reads.getPublishedArticles.mockResolvedValue({
      status: "ok",
      articles: [
        article("school-news"),
        article("pta-day"),
        article("reunion"),
      ],
    });
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain("https://flordegraceschoolinc.com/news/school-news");
    expect(urls).toContain("https://flordegraceschoolinc.com/news/pta-day");
    expect(urls).toContain("https://flordegraceschoolinc.com/news/reunion");
    // No category options: the read returns every category.
    expect(reads.getPublishedArticles).toHaveBeenCalledWith();
  });

  it("still lists the static pages when articles are unavailable", async () => {
    reads.getPublishedArticles.mockResolvedValue({ status: "unavailable" });
    expect(await sitemap()).toHaveLength(3);
  });

  it("is empty until the site is indexable", async () => {
    vi.stubEnv("SITE_INDEXABLE", "false");
    expect(await sitemap()).toEqual([]);
  });
});
