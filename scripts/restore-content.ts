import { readFile, readdir, mkdir, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { loadEnvironment } from "./environment";
import {
  getPool,
  rows,
  mutate,
  transaction,
  type SqlValue,
} from "../src/lib/content/db";
import { mediaRoot, safeMediaPath } from "../src/lib/content/media";

await loadEnvironment();
if (
  !process.env.DB_NAME ||
  process.env.FGS_RESTORE_DATABASE !== process.env.DB_NAME
)
  throw new Error(
    "Name the restore destination explicitly with FGS_RESTORE_DATABASE.",
  );
const directory = path.resolve(process.argv[2] ?? "");
const bytes = await readFile(path.join(directory, "content.json"));
const checksum = (
  await readFile(path.join(directory, "content.sha256"), "utf8")
).trim();
if (createHash("sha256").update(bytes).digest("hex") !== checksum)
  throw new Error("Backup checksum mismatch.");
const backup = JSON.parse(bytes.toString("utf8"));
if (backup.version !== 1) throw new Error("Unsupported backup version.");
const tables = [
  "sections",
  "media",
  "media_variants",
  "articles",
  "article_images",
  "legacy_urls",
];
try {
  for (const table of tables) {
    const [count] = await rows("SELECT COUNT(*) AS total FROM " + table);
    if (Number(count.total))
      throw new Error("Restore requires an empty destination database.");
    if (!Array.isArray(backup[table])) throw new Error("Incomplete backup.");
  }
  await mkdir(mediaRoot(), { recursive: true, mode: 0o700 });
  if ((await readdir(mediaRoot())).length)
    throw new Error("Restore requires an empty media directory.");
  for (const item of backup.media) {
    const source = safeMediaPath(
      path.join(directory, "files"),
      String(item.path).split("/"),
    );
    const file = await readFile(source);
    if (
      createHash("sha256").update(file).digest("hex") !== item.checksum ||
      file.length !== Number(item.size_bytes)
    )
      throw new Error("Backup media checksum mismatch.");
  }
  for (const item of backup.media) {
    const target = safeMediaPath(mediaRoot(), String(item.path).split("/"));
    await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    await copyFile(
      safeMediaPath(
        path.join(directory, "files"),
        String(item.path).split("/"),
      ),
      target,
    );
  }
  await transaction(async (connection) => {
    for (const table of tables) {
      const columns = await rows(
        "SELECT COLUMN_NAME AS name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
        [table],
        connection,
      );
      const allowed = new Set(columns.map((c) => String(c.name)));
      for (const item of backup[table]) {
        const keys = Object.keys(item);
        if (!keys.length || keys.some((key) => !allowed.has(key)))
          throw new Error("Backup schema mismatch.");
        const values: SqlValue[] = keys.map((key) =>
          typeof item[key] === "object" && item[key] !== null
            ? JSON.stringify(item[key])
            : item[key],
        );
        await mutate(
          "INSERT INTO " +
            table +
            " (" +
            keys.map((key) => "`" + key + "`").join(",") +
            ") VALUES (" +
            keys.map(() => "?").join(",") +
            ")",
          values,
          connection,
        );
      }
    }
  });
  console.log("Restored and verified content in the empty destination.");
} finally {
  await getPool().end();
}
