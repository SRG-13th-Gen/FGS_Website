import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { getPool, rows, mutate, transaction } from "@/lib/content/db";
import { publishArticle } from "@/lib/content/publish";
import { updateArticle, trashArticle } from "@/lib/content/edit-article";
import { getArticleBySlug, getPublishedArticles } from "@/lib/content/reads";
import { SEPARATE_AREA_CATEGORIES } from "@/lib/content/display";
import {
  getArticleForEdit,
  listArticlesForAdmin,
} from "@/lib/content/admin-articles";
import { saveSectionRaw } from "@/lib/content/sections/adapter";
import { uploadMedia, readMediaFile, safeMediaPath } from "@/lib/content/media";
import { listMediaLibrary } from "@/lib/content/media-library";
import type { PublishArticleInput } from "@/lib/content/types";
if (
  !process.env.DB_NAME?.endsWith("_fgstest") ||
  process.env.FGS_TEST_DATABASE !== process.env.DB_NAME
)
  throw new Error(
    "Database tests require the explicitly named disposable test database.",
  );
let mediaDirectory: string;
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
const input = (
  overrides: Partial<PublishArticleInput> = {},
): PublishArticleInput => ({
  title: "School celebration",
  category: "events",
  body: "A school story.",
  images: [],
  mutationKey: randomUUID(),
  ...overrides,
});
beforeAll(async () => {
  mediaDirectory = await mkdtemp(path.join(tmpdir(), "fgs-media-"));
  process.env.MEDIA_STORAGE_PATH = mediaDirectory;
});
beforeEach(async () => {
  for (const table of [
    "article_images",
    "articles",
    "media_variants",
    "media",
    "sections",
    "legacy_urls",
  ])
    await mutate("DELETE FROM " + table);
});
afterAll(async () => {
  for (const table of [
    "article_images",
    "articles",
    "media_variants",
    "media",
    "sections",
    "legacy_urls",
  ])
    await mutate("DELETE FROM " + table);
  await getPool().end();
  await rm(mediaDirectory, { recursive: true, force: true });
});
describe("real MySQL content operations", () => {
  it("publishes once per request identity and supports editable round trips", async () => {
    const request = input();
    const first = await publishArticle(request);
    const repeated = await publishArticle(request);
    expect(first).toMatchObject({ status: "success", revision: 1 });
    expect(repeated).toMatchObject({ status: "success" });
    const [count] = await rows("SELECT COUNT(*) AS total FROM articles");
    expect(Number(count.total)).toBe(1);
    const [row] = await rows("SELECT id, slug FROM articles");
    const edit = await getArticleForEdit(row.id);
    expect(edit).toMatchObject({
      status: "editable",
      article: { body: request.body, revision: 1 },
    });
    expect(
      await updateArticle({
        ...request,
        postId: row.id,
        expectedRevision: 1,
        title: "Edited title",
      }),
    ).toMatchObject({ status: "success", revision: 2 });
    expect(
      await updateArticle({
        ...request,
        postId: row.id,
        expectedRevision: 1,
        title: "Stale title",
      }),
    ).toMatchObject({ status: "error" });
    expect(await getArticleBySlug(row.slug)).toMatchObject({
      status: "ok",
      article: { title: "Edited title" },
    });
  });
  it("soft deletion removes public content while retaining the stored article", async () => {
    await publishArticle(input());
    const [row] = await rows("SELECT id, slug FROM articles");
    expect(await trashArticle(row.id)).toEqual({ status: "success" });
    expect(await getArticleBySlug(row.slug)).toEqual({ status: "not-found" });
    const [stored] = await rows("SELECT status, body FROM articles");
    expect(stored.status).toBe("trash");
    expect(stored.body).toBe("A school story.");
  });
  it("does not expose drafts", async () => {
    await publishArticle(input());
    const [row] = await rows("SELECT id, slug FROM articles");
    await mutate("UPDATE articles SET status = 'draft' WHERE id = ?", [row.id]);
    expect(await getArticleBySlug(row.slug)).toEqual({ status: "not-found" });
  });
  it("stores pta and alumni articles and keeps each area separate", async () => {
    for (const [title, category] of [
      ["School news", "announcements"],
      ["PTA day", "pta"],
      ["Alumni reunion", "alumni"],
      ["Trashed alumni", "alumni"],
    ] as const)
      expect(await publishArticle(input({ title, category }))).toMatchObject({
        status: "success",
      });
    const [trashed] = await rows(
      "SELECT id FROM articles WHERE title = 'Trashed alumni'",
    );
    await trashArticle(trashed.id);

    const titles = async (
      options?: Parameters<typeof getPublishedArticles>[0],
    ) => {
      const result = await getPublishedArticles(options);
      if (result.status !== "ok") throw new Error("unavailable");
      return result.articles.map((a) => a.title).sort();
    };
    // Default: every published category, never trash.
    expect(await titles()).toEqual([
      "Alumni reunion",
      "PTA day",
      "School news",
    ]);
    // Homepage feed: school news only.
    expect(
      await titles({ excludeCategories: SEPARATE_AREA_CATEGORIES }),
    ).toEqual(["School news"]);
    // Area pages.
    expect(await titles({ categories: ["pta"] })).toEqual(["PTA day"]);
    expect(await titles({ categories: ["alumni"] })).toEqual([
      "Alumni reunion",
    ]);
    // Admin lists filter by category too.
    const admin = await listArticlesForAdmin({
      search: "",
      category: "alumni",
      page: 1,
    });
    expect(admin).toMatchObject({ status: "ok", total: 1 });
    // The ENUM rejects unknown values.
    await expect(
      mutate("UPDATE articles SET category = 'sports' WHERE id = ?", [
        trashed.id,
      ]),
    ).rejects.toThrow();
  });
  it("supports image-only articles and reuses immutable media", async () => {
    const file = new File([png], "school.png", { type: "image/png" });
    const media = await uploadMedia(file, "School photo");
    const same = await uploadMedia(file, "School photo");
    expect(same.mediaId).toBe(media.mediaId);
    const request = input({
      body: "",
      images: [
        {
          clientId: "photo",
          existingMediaId: media.mediaId,
          file: new File([], ""),
          caption: "Class",
          altText: "School photo",
        },
      ],
    });
    expect(await publishArticle(request)).toMatchObject({ status: "success" });
    const [row] = await rows("SELECT id, slug FROM articles");
    expect(await getArticleBySlug(row.slug)).toMatchObject({
      status: "ok",
      article: { coverImage: { alt: "School photo" } },
    });
    const item = await rows("SELECT path FROM media");
    expect(await readMediaFile(item[0].path)).toEqual(Buffer.from(png));
    expect(
      (await readFile(safeMediaPath(mediaDirectory, item[0].path.split("/"))))
        .length,
    ).toBe(png.length);
  });
  it("rejects excessive aggregate uploads before creating records", async () => {
    const file = new File([new Uint8Array(9 * 1024 * 1024)], "a.png");
    const request = input({
      images: Array.from({ length: 7 }, (_, i) => ({
        clientId: String(i),
        existingMediaId: null,
        file,
        caption: "",
        altText: "",
      })),
    });
    const result = await publishArticle(request);
    expect(result.status).toBe("validation_error");
    const [count] = await rows("SELECT COUNT(*) AS total FROM articles");
    expect(Number(count.total)).toBe(0);
  });
  it("rolls back writes when an image relationship fails", async () => {
    await expect(
      transaction(async (connection) => {
        const article = await mutate(
          "INSERT INTO articles (slug,title,category,body) VALUES ('rollback','Rollback','events','body')",
          [],
          connection,
        );
        await mutate(
          "INSERT INTO article_images (article_id, position, media_id, alt, caption) VALUES (?, 0, 99999999, '', '')",
          [article.insertId],
          connection,
        );
      }),
    ).rejects.toThrow();
    expect(
      await rows("SELECT id FROM articles WHERE slug = 'rollback'"),
    ).toHaveLength(0);
  });
  it("allows exactly one concurrent section save from the same revision", async () => {
    await mutate(
      "INSERT INTO sections (slug,data) VALUES ('site-contact', '{}')",
    );
    const results = await Promise.all([
      saveSectionRaw("site-contact", { heading: "One" }, 1),
      saveSectionRaw("site-contact", { heading: "Two" }, 1),
    ]);
    expect(results.filter((r) => r.status === "success")).toHaveLength(1);
    expect(results.filter((r) => r.status === "error")).toHaveLength(1);
  });
  it("paginates and searches articles in the database", async () => {
    for (let i = 0; i < 12; i++)
      await publishArticle(input({ title: "Event " + i }));
    expect(
      await listArticlesForAdmin({
        search: "Event",
        category: "events",
        page: 2,
      }),
    ).toMatchObject({
      status: "ok",
      total: 12,
      totalPages: 2,
      items: expect.any(Array),
    });
    const result = await listArticlesForAdmin({
      search: "Event",
      category: "events",
      page: 2,
    });
    if (result.status === "ok") expect(result.items).toHaveLength(2);
    expect(
      await listArticlesForAdmin({
        search: "' OR 1=1",
        category: "all",
        page: 1,
      }),
    ).toMatchObject({ status: "ok", total: 0 });
  });
  it("keeps media library filtering separate from all stored assets", async () => {
    await uploadMedia(new File([png], "school.png"), "School");
    const result = await listMediaLibrary({ search: "School", page: 1 });
    expect(result).toMatchObject({ status: "ok", total: 1 });
  });
});
