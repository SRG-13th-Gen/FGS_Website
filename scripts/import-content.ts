import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { decodeHTML } from "entities";
import { loadEnvironment } from "./environment";
import { snapshotSchema } from "./migration/snapshot";
import { normalizeLegacyArticle, legacyCategory } from "./migration/normalize";
import { getPool, rows, mutate, transaction } from "../src/lib/content/db";
import { safeMediaPath, mediaRoot, mediaUrl } from "../src/lib/content/media";
import { SECTION_REGISTRY } from "../src/lib/content/sections/registry";
import { sniffImageMimeType } from "../src/lib/content/image-type";
await loadEnvironment();
const directory = path.resolve(process.argv[2] ?? "");
const snapshot = snapshotSchema.parse(
  JSON.parse(await readFile(path.join(directory, "snapshot.json"), "utf8")),
);
const report = {
  media: 0,
  variants: 0,
  articles: 0,
  sections: 0,
  preservedEdits: 0,
  duplicates: 0,
  brokenReferences: [] as string[],
  rejectedConversions: [] as string[],
};
const fileMap = new Map<
  string,
  { path: string; checksum: string; bytes: number; mime: string }
>();
const sourceMediaIds = new Map<number, number>();
function sqlDate(value: string | undefined): string | null {
  return value ? value.replace(/Z$/, "").replace("T", " ") : null;
}
function plain(raw: string): string {
  return decodeHTML(raw.replace(/<[^>]+>/g, "")).trim();
}
async function alias(oldPath: string, target: string) {
  if (oldPath !== target)
    await mutate(
      "INSERT INTO legacy_urls (path, target) VALUES (?, ?) ON DUPLICATE KEY UPDATE path = path",
      [oldPath, target],
    );
}
try {
  await mkdir(mediaRoot(), { recursive: true, mode: 0o700 });
  for (const file of snapshot.files) {
    if (!/^files\/[a-f0-9]{64}\.[a-z0-9]{1,8}$/.test(file.path))
      throw new Error("Invalid snapshot file path.");
    const bytes = await readFile(path.join(directory, file.path));
    if (
      bytes.length !== file.bytes ||
      createHash("sha256").update(bytes).digest("hex") !== file.checksum
    )
      throw new Error("Snapshot checksum mismatch.");
    const filename = path.basename(file.path);
    const destination = filename.slice(0, 2) + "/" + filename;
    const target = safeMediaPath(mediaRoot(), destination.split("/"));
    await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    try {
      const existing = await readFile(target);
      if (createHash("sha256").update(existing).digest("hex") !== file.checksum)
        throw new Error("Existing asset checksum mismatch.");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await copyFile(path.join(directory, file.path), target);
    }
    const detected = sniffImageMimeType(bytes);
    fileMap.set(file.url, {
      ...file,
      path: destination,
      mime: detected ?? file.mime,
    });
    const sourcePath = new URL(file.url).pathname;
    await alias(sourcePath, mediaUrl(destination));
  }
  for (const item of snapshot.media) {
    if (!item.source_url) continue;
    const file = fileMap.get(item.source_url);
    if (!file) {
      report.brokenReferences.push("media:" + item.id);
      continue;
    }
    const key = "legacy-media:" + item.id;
    const [existing] = await rows("SELECT id FROM media WHERE source_key = ?", [
      key,
    ]);
    let id: number;
    if (existing) {
      id = Number(existing.id);
      report.preservedEdits++;
    } else {
      let attachmentPath = file.path;
      const [shared] = await rows("SELECT id FROM media WHERE path = ?", [
        file.path,
      ]);
      if (shared) {
        report.duplicates++;
        attachmentPath = file.path.replace(
          /(\.[a-z0-9]+)$/,
          "-attachment-" + item.id + "$1",
        );
        const destination = safeMediaPath(
          mediaRoot(),
          attachmentPath.split("/"),
        );
        await copyFile(
          safeMediaPath(mediaRoot(), file.path.split("/")),
          destination,
        );
      }
      const result = await mutate(
        "INSERT INTO media (source_key, path, filename, mime_type, size_bytes, checksum, alt, caption, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, UTC_TIMESTAMP(3)))",
        [
          key,
          attachmentPath,
          path.basename(new URL(item.source_url).pathname),
          file.mime,
          file.bytes,
          file.checksum,
          item.alt_text ?? "",
          plain(item.caption?.raw ?? item.caption?.rendered ?? ""),
          sqlDate(item.date_gmt),
        ],
      );
      id = result.insertId;
      report.media++;
    }
    sourceMediaIds.set(item.id, id);
  }
  for (const [url, file] of fileMap) {
    const [existing] = await rows(
      "SELECT id, source_key FROM media WHERE path = ?",
      [file.path],
    );
    if (existing) {
      if (String(existing.source_key).startsWith("asset:"))
        await mutate(
          "INSERT IGNORE INTO media_variants (media_id) VALUES (?)",
          [Number(existing.id)],
        );
      continue;
    }
    const variant = await mutate(
      "INSERT INTO media (source_key, path, filename, mime_type, size_bytes, checksum, alt, caption) VALUES (?, ?, ?, ?, ?, ?, '', '')",
      [
        "asset:" + createHash("sha256").update(url).digest("hex"),
        file.path,
        path.basename(new URL(url).pathname),
        file.mime,
        file.bytes,
        file.checksum,
      ],
    );
    await mutate("INSERT INTO media_variants (media_id) VALUES (?)", [
      variant.insertId,
    ]);
    report.variants++;
  }
  async function remapRefs(input: unknown): Promise<unknown> {
    if (Array.isArray(input)) return Promise.all(input.map(remapRefs));
    if (input && typeof input === "object") {
      const object = input as Record<string, unknown>;
      const next: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(object)) {
        if (key === "mediaId" && typeof value === "number") {
          const id = sourceMediaIds.get(value);
          if (!id) throw new Error("Missing section image: " + value);
          next[key] = id;
        } else next[key] = await remapRefs(value);
      }
      return next;
    }
    return input;
  }
  for (const entry of SECTION_REGISTRY) {
    const page = snapshot.pages.find((p) => p.slug === entry.slug);
    if (!page) {
      report.brokenReferences.push(entry.slug);
      continue;
    }
    const raw = page.meta?.fgs_section_data;
    try {
      const value = typeof raw === "string" ? JSON.parse(raw) : raw;
      const data = entry.schema.parse(await remapRefs(value));
      const [existing] = await rows(
        "SELECT slug FROM sections WHERE slug = ?",
        [entry.slug],
      );
      if (existing) {
        report.preservedEdits++;
        continue;
      }
      await mutate(
        "INSERT INTO sections (slug, data, modified_at) VALUES (?, ?, COALESCE(?, UTC_TIMESTAMP(3)))",
        [entry.slug, JSON.stringify(data), sqlDate(page.modified_gmt)],
      );
      report.sections++;
    } catch {
      report.rejectedConversions.push(entry.slug);
    }
  }
  for (const post of snapshot.posts) {
    const key = "legacy-post:" + post.id;
    const [existing] = await rows(
      "SELECT id FROM articles WHERE source_key = ?",
      [key],
    );
    const target = "/news/" + post.slug;
    await alias(new URL(post.link).pathname, target);
    await alias("/" + post.slug + "/", target);
    if (existing) {
      report.preservedEdits++;
      continue;
    }
    const normalized = normalizeLegacyArticle(
      post.content?.raw ?? post.content?.rendered ?? "",
    );
    let body = normalized.body;
    for (const [old, file] of fileMap)
      body = body.split(old).join(mediaUrl(file.path));
    for (const page of snapshot.pages)
      if (page.slug === "website") body = body.split(page.link).join("/");
    for (const origin of snapshot.origins) {
      for (const item of snapshot.posts) {
        body = body
          .split(origin + new URL(item.link).pathname)
          .join("/news/" + item.slug);
        body = body
          .split(origin + "/" + item.slug + "/")
          .join("/news/" + item.slug);
      }
      for (const page of snapshot.pages)
        if (page.slug === "website")
          body = body.split(origin + new URL(page.link).pathname).join("/");
    }
    const images: { id: number; alt: string; caption: string }[] = [];
    if (post.featured_media) {
      const id = sourceMediaIds.get(post.featured_media);
      const original = snapshot.media.find((m) => m.id === post.featured_media);
      if (!id) report.brokenReferences.push(post.slug + ":cover");
      else
        images.push({
          id,
          alt:
            original?.alt_text || plain(post.title.raw ?? post.title.rendered),
          caption: plain(
            original?.caption?.raw ?? original?.caption?.rendered ?? "",
          ),
        });
    }
    for (const image of normalized.images) {
      const file = fileMap.get(image.url);
      let id = image.sourceId ? sourceMediaIds.get(image.sourceId) : undefined;
      if (file && !id) {
        const [item] = await rows("SELECT id FROM media WHERE path = ?", [
          file.path,
        ]);
        if (item) id = Number(item.id);
      }
      if (!id) {
        report.brokenReferences.push(post.slug + ":image");
        continue;
      }
      if (images.some((i) => i.id === id)) {
        const existingImage = images.find((i) => i.id === id)!;
        if (image.caption) existingImage.caption = image.caption;
        report.duplicates++;
        continue;
      }
      images.push({
        id,
        alt: image.alt || plain(post.title.raw ?? post.title.rendered),
        caption: image.caption,
      });
    }
    if (images.length > 20 || (!body && !images.length)) {
      report.rejectedConversions.push(post.slug);
      continue;
    }
    await transaction(async (connection) => {
      const result = await mutate(
        "INSERT INTO articles (source_key, slug, title, category, body, status, published_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, UTC_TIMESTAMP(3)))",
        [
          key,
          post.slug,
          plain(post.title.raw ?? post.title.rendered),
          legacyCategory(post.slug),
          body,
          post.status === "publish" ? "publish" : "draft",
          sqlDate(post.date_gmt),
          sqlDate(post.modified_gmt),
        ],
        connection,
      );
      for (let index = 0; index < images.length; index++)
        await mutate(
          "INSERT INTO article_images (article_id, position, media_id, alt, caption) VALUES (?, ?, ?, ?, ?)",
          [
            result.insertId,
            index,
            images[index].id,
            images[index].alt,
            images[index].caption,
          ],
          connection,
        );
    });
    report.articles++;
  }
  for (const page of snapshot.pages)
    if (page.slug === "website") {
      await alias(new URL(page.link).pathname, "/");
      await alias("/website", "/");
      await alias("/website/", "/");
    }
  const [totals] = await rows(
    "SELECT (SELECT COUNT(*) FROM sections) AS sections, (SELECT COUNT(*) FROM articles WHERE status = 'publish') AS articles, (SELECT COUNT(*) FROM media) AS media",
  );
  await writeFile(
    path.join(directory, "import-report-" + process.env.DB_NAME + ".json"),
    JSON.stringify({ snapshot: snapshot.createdAt, report, totals }, null, 2),
    { mode: 0o600 },
  );
  console.log(JSON.stringify({ report, totals }));
  if (report.brokenReferences.length || report.rejectedConversions.length)
    process.exitCode = 1;
} finally {
  await getPool().end();
}
