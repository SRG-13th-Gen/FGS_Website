import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { loadEnvironment } from "./environment";
import { getPool, rows } from "../src/lib/content/db";
import { readMediaFile } from "../src/lib/content/media";
await loadEnvironment();
const directory = path.resolve(
  process.argv[2] ??
    ".data/backups/" + new Date().toISOString().replaceAll(":", "-"),
);
await mkdir(path.join(directory, "files"), { recursive: true, mode: 0o700 });
const connection = await getPool().getConnection();
try {
  await connection.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
  await connection.query("START TRANSACTION WITH CONSISTENT SNAPSHOT");
  const data: Record<string, unknown> = {
    version: 1,
    createdAt: new Date().toISOString(),
  };
  for (const table of [
    "schema_migrations",
    "sections",
    "media",
    "media_variants",
    "articles",
    "article_images",
    "legacy_urls",
  ])
    data[table] = await rows("SELECT * FROM " + table, [], connection);
  for (const media of data.media as { path: string; checksum: string }[]) {
    const bytes = await readMediaFile(media.path);
    if (createHash("sha256").update(bytes).digest("hex") !== media.checksum)
      throw new Error("Media checksum mismatch.");
    const target = path.join(directory, "files", media.path);
    await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    await writeFile(target, bytes, { mode: 0o600 });
  }
  await connection.commit();
  const json = JSON.stringify(data, null, 2);
  await writeFile(path.join(directory, "content.json"), json, { mode: 0o600 });
  await writeFile(
    path.join(directory, "content.sha256"),
    createHash("sha256").update(json).digest("hex") + "\n",
    { mode: 0o600 },
  );
  // Reading back the serialized export detects incomplete local writes.
  JSON.parse(await readFile(path.join(directory, "content.json"), "utf8"));
  console.log("Verified database and media backup created.");
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
  await getPool().end();
}
