import { afterAll, beforeAll, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { getPool, rows, mutate } from "@/lib/content/db";
import { SECTION_REGISTRY } from "@/lib/content/sections/registry";
const execute = promisify(execFile);
if (
  !process.env.DB_NAME?.endsWith("_fgstest") ||
  process.env.FGS_TEST_DATABASE !== process.env.DB_NAME
)
  throw new Error(
    "Importer tests require the explicitly named disposable test database.",
  );
let directory: string;
const clear = async () => {
  for (const table of [
    "article_images",
    "articles",
    "media_variants",
    "media",
    "sections",
    "legacy_urls",
  ])
    await mutate("DELETE FROM " + table);
};
const run = async (script: string, argument: string, env = {}) =>
  execute(
    process.execPath,
    [
      "--conditions=react-server",
      "--import",
      "tsx",
      "scripts/" + script + ".ts",
      argument,
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        MEDIA_STORAGE_PATH: path.join(directory, "media"),
        ...env,
      },
      timeout: 90000,
    },
  );
beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "fgs-import-"));
  await clear();
});
afterAll(async () => {
  await clear();
  await getPool().end();
  await rm(directory, { recursive: true, force: true });
});
it("imports nested and image-only articles, preserves edits on repeat import, and restores a verified backup", async () => {
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
  const checksum = createHash("sha256").update(png).digest("hex");
  const origin = "https://legacy.example";
  const original = origin + "/wp-content/uploads/photo.png";
  const variant = origin + "/wp-content/uploads/photo-300x300.png";
  const file = "files/" + checksum + ".png";
  await mkdir(path.join(directory, "files"));
  await writeFile(path.join(directory, file), png);
  const remap = (value: unknown): unknown =>
    Array.isArray(value)
      ? value.map(remap)
      : value && typeof value === "object"
        ? Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
              key,
              key === "mediaId" ? 123 : remap(item),
            ]),
          )
        : value;
  const common = {
    status: "publish",
    date_gmt: "2025-02-01T10:00:00",
    modified_gmt: "2025-02-02T10:00:00",
  };
  await writeFile(
    path.join(directory, "snapshot.json"),
    JSON.stringify({
      version: 1,
      createdAt: "2026-10-04",
      origins: [origin],
      sourceInventories: [],
      media: [
        {
          id: 123,
          slug: "photo",
          link: original,
          source_url: original,
          title: { rendered: "Photo" },
          mime_type: "image/png",
          alt_text: "Photo",
          caption: { rendered: "Metadata caption" },
        },
      ],
      files: [
        {
          url: original,
          path: file,
          checksum,
          bytes: png.length,
          mime: "image/png",
        },
        {
          url: variant,
          path: file,
          checksum,
          bytes: png.length,
          mime: "image/png",
        },
      ],
      pages: SECTION_REGISTRY.map((entry, index) => ({
        ...common,
        id: index + 1,
        slug: entry.slug,
        link: origin + "/" + entry.slug + "/",
        title: { rendered: entry.label },
        meta: { fgs_section_data: remap(entry.defaults) },
      })),
      posts: [
        {
          ...common,
          id: 1,
          slug: "summer-class-old",
          link: origin + "/summer-class-old/",
          title: { rendered: "Summer class" },
          featured_media: 123,
          content: {
            raw:
              '<p>Original wording <a href="https://example.org">link</a>.</p><figure class="wp-block-gallery"><figure><img class="wp-image-123" src="' +
              variant +
              '" alt="Class"><figcaption>Original caption</figcaption></figure></figure>',
            rendered: "",
          },
        },
        {
          ...common,
          id: 2,
          slug: "test-post",
          link: origin + "/test-post/",
          title: { rendered: "Parents" },
          content: {
            raw:
              '<figure><img class="wp-image-123" src="' +
              original +
              '"/></figure>',
            rendered: "",
          },
        },
      ],
    }),
  );
  const fixture = JSON.parse(
    await readFile(path.join(directory, "snapshot.json"), "utf8"),
  );
  fixture.pages.push({
    ...common,
    id: 100,
    slug: "website",
    link: origin + "/",
    title: { rendered: "Homepage" },
  });
  fixture.media.push({
    ...fixture.media[0],
    id: 456,
    caption: { rendered: "Second attachment caption" },
  });
  await writeFile(
    path.join(directory, "snapshot.json"),
    JSON.stringify(fixture),
  );
  await run("import-content", directory);
  expect(
    await rows(
      "SELECT path,target FROM legacy_urls WHERE target='/' ORDER BY path",
    ),
  ).toEqual([
    { path: "/website", target: "/" },
    { path: "/website/", target: "/" },
  ]);
  expect(
    await rows(
      "SELECT source_key FROM media WHERE source_key LIKE 'legacy-media:%'",
    ),
  ).toHaveLength(2);
  expect(
    (
      await rows(
        "SELECT caption FROM media WHERE source_key = 'legacy-media:456'",
      )
    )[0].caption,
  ).toBe("Second attachment caption");
  expect(await rows("SELECT slug FROM sections")).toHaveLength(7);
  const articles = await rows("SELECT * FROM articles ORDER BY source_key");
  expect(articles).toHaveLength(2);
  expect(articles[0]).toMatchObject({
    category: "events",
    published_at: "2025-02-01 10:00:00",
  });
  expect(articles[0].body).toContain(
    "Original wording link (https://example.org).",
  );
  expect(articles[1].body).toBe("");
  expect(
    (
      await rows("SELECT caption FROM article_images WHERE article_id = ?", [
        articles[0].id,
      ])
    )[0].caption,
  ).toBe("Original caption");
  await mutate(
    "UPDATE articles SET title = 'Administrator edit', revision = 2 WHERE id = ?",
    [articles[0].id],
  );
  await mutate("UPDATE sections SET revision = 2 WHERE slug = 'site-contact'");
  await run("import-content", directory);
  expect(
    (await rows("SELECT title FROM articles WHERE id = ?", [articles[0].id]))[0]
      .title,
  ).toBe("Administrator edit");
  expect(
    (await rows("SELECT revision FROM sections WHERE slug = 'site-contact'"))[0]
      .revision,
  ).toBe(2);
  const report = JSON.parse(
    await readFile(
      path.join(directory, "import-report-" + process.env.DB_NAME + ".json"),
      "utf8",
    ),
  );
  expect(report.report.brokenReferences).toEqual([]);
  expect(report.report.rejectedConversions).toEqual([]);
  const backup = path.join(directory, "backup");
  await run("backup-content", backup);
  await clear();
  const restoreRoot = path.join(directory, "restored-media");
  await run("restore-content", backup, {
    MEDIA_STORAGE_PATH: restoreRoot,
    FGS_RESTORE_DATABASE: process.env.DB_NAME,
  });
  expect(
    (await rows("SELECT title FROM articles WHERE id = ?", [articles[0].id]))[0]
      .title,
  ).toBe("Administrator edit");
  const [media] = await rows("SELECT path FROM media");
  expect(await readFile(path.join(restoreRoot, media.path))).toEqual(png);
  await expect(
    run("restore-content", backup, {
      MEDIA_STORAGE_PATH: restoreRoot,
      FGS_RESTORE_DATABASE: process.env.DB_NAME,
    }),
  ).rejects.toThrow();
}, 120000);
