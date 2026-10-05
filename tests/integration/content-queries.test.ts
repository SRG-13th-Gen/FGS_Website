import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({ rows: vi.fn(), mutate: vi.fn() }));
vi.mock("@/lib/content/db", () => ({
  ...db,
  isoDate: (s: string | null) => (s ? s + "Z" : null),
}));
import { articleAreaNav, articleAreaOptions } from "@/lib/content/display";
import { getArticleBySlug, getPublishedArticles } from "@/lib/content/reads";
import { listArticlesForAdmin } from "@/lib/content/admin-articles";
import { listMediaLibrary } from "@/lib/content/media-library";
import {
  saveSectionRaw,
  fetchSectionPage,
} from "@/lib/content/sections/adapter";
beforeEach(() => vi.resetAllMocks());
describe("database query boundaries", () => {
  it("distinguishes missing published content from database failure", async () => {
    db.rows.mockResolvedValueOnce([]);
    expect(await getArticleBySlug("missing")).toEqual({ status: "not-found" });
    expect(db.rows).toHaveBeenCalledWith(
      expect.stringContaining("status = 'publish'"),
      ["missing"],
    );
    db.rows.mockRejectedValueOnce(new Error("database"));
    expect(await getArticleBySlug("missing")).toEqual({
      status: "unavailable",
    });
  });
  it("public queries always restrict publication", async () => {
    db.rows.mockResolvedValue([]);
    expect(await getPublishedArticles()).toEqual({
      status: "ok",
      articles: [],
    });
    expect(db.rows.mock.calls[0][0]).toContain("status = 'publish'");
  });
  it("lists every published category by default", async () => {
    db.rows.mockResolvedValue([]);
    await getPublishedArticles();
    expect(db.rows.mock.calls[0][0]).not.toContain("category");
    expect(db.rows.mock.calls[0][1]).toEqual([]);
  });

  it("excludes or selects categories only through explicit parameterized options", async () => {
    db.rows.mockResolvedValue([]);
    await getPublishedArticles({ excludeCategories: ["pta", "alumni"] });
    expect(db.rows.mock.calls[0][0]).toContain(
      "status = 'publish' AND category NOT IN (?,?) ORDER BY",
    );
    expect(db.rows.mock.calls[0][1]).toEqual(["pta", "alumni"]);

    await getPublishedArticles({ categories: ["pta"] });
    expect(db.rows.mock.calls[1][0]).toContain("AND category IN (?) ORDER BY");
    expect(db.rows.mock.calls[1][1]).toEqual(["pta"]);

    await getPublishedArticles({
      categories: ["alumni"],
      excludeCategories: ["pta"],
    });
    expect(db.rows.mock.calls[2][1]).toEqual(["alumni", "pta"]);
    for (const [sql] of db.rows.mock.calls) expect(sql).not.toContain("alumni");
  });

  it("keeps school news out of the PTA and alumni areas and vice versa", () => {
    expect(articleAreaOptions("pta")).toEqual({ categories: ["pta"] });
    expect(articleAreaOptions("alumni")).toEqual({ categories: ["alumni"] });
    for (const category of ["announcements", "events", "clubs"] as const)
      expect(articleAreaOptions(category)).toEqual({
        excludeCategories: ["pta", "alumni"],
      });
  });

  it("sends an article's back and view-all links to its own area", () => {
    expect(articleAreaNav("pta")).toMatchObject({
      href: "/pta",
      backLabel: "Back to PTA",
    });
    expect(articleAreaNav("alumni")).toMatchObject({
      href: "/alumni",
      backLabel: "Back to Alumni",
    });
    for (const category of ["announcements", "events", "clubs"] as const)
      expect(articleAreaNav(category)).toMatchObject({
        href: "/#news",
        backLabel: "Back to News & Events",
      });
  });

  it("uses parameterized search and database pagination", async () => {
    db.rows.mockResolvedValueOnce([{ total: 0 }]).mockResolvedValueOnce([]);
    await listArticlesForAdmin({
      search: "' OR 1=1 %",
      category: "events",
      page: 2,
    });
    expect(db.rows.mock.calls[0][0]).not.toContain("OR 1=1");
    expect(db.rows.mock.calls[0][1]).toEqual(["%' OR 1=1 \\%%", "events"]);
    expect(db.rows.mock.calls[1][0]).toContain("OFFSET 10");
  });
  it("exposes only image media in the library", async () => {
    db.rows.mockResolvedValueOnce([{ total: 0 }]).mockResolvedValueOnce([]);
    expect(await listMediaLibrary({ search: "", page: 1 })).toMatchObject({
      status: "ok",
      total: 0,
    });
    expect(db.rows.mock.calls[0][0]).toContain("mime_type LIKE 'image/%'");
  });
  it("rejects stale section revisions", async () => {
    db.mutate.mockResolvedValue({ affectedRows: 0 });
    expect(await saveSectionRaw("site-hero", {}, 2)).toMatchObject({
      status: "error",
    });
    expect(db.mutate.mock.calls[0][0]).toContain("AND revision = ?");
  });
  it("never writes a section without a loaded revision", async () => {
    expect(await saveSectionRaw("site-hero", {}, 0)).toMatchObject({
      status: "error",
    });
    expect(db.mutate).not.toHaveBeenCalled();
  });
  it("decodes stored section JSON and revision", async () => {
    db.rows.mockResolvedValue([
      { data: '{"heading":"School"}', revision: 3, modified_at: null },
    ]);
    expect(await fetchSectionPage("site-hero")).toMatchObject({
      data: { heading: "School" },
      revision: 3,
    });
  });
});
