import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadEnvironment } from "./environment";
import { getPool, rows, mutate } from "../src/lib/content/db";
await loadEnvironment();
const connection = await getPool().getConnection();
try {
  const [lock] = await rows(
    "SELECT GET_LOCK('fgs_schema_migrations', 30) AS acquired",
    [],
    connection,
  );
  if (Number(lock.acquired) !== 1)
    throw new Error("Migration lock unavailable.");
  await mutate(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(255) PRIMARY KEY, checksum CHAR(64) NOT NULL, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    [],
    connection,
  );
  const files = (await readdir(new URL("../db/migrations/", import.meta.url)))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = await readFile(
      new URL("../db/migrations/" + file, import.meta.url),
      "utf8",
    );
    const checksum = createHash("sha256").update(sql).digest("hex");
    const [existing] = await rows(
      "SELECT checksum FROM schema_migrations WHERE name = ?",
      [file],
      connection,
    );
    if (existing) {
      if (existing.checksum !== checksum)
        throw new Error("Applied migration changed: " + file);
      continue;
    }
    // Statements are intentionally idempotent: MySQL DDL commits implicitly.
    for (const statement of sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean))
      await connection.query(statement);
    await mutate(
      "INSERT INTO schema_migrations (name, checksum) VALUES (?, ?)",
      [file, checksum],
      connection,
    );
    console.log("Applied " + file);
  }
} finally {
  await rows("SELECT RELEASE_LOCK('fgs_schema_migrations')", [], connection);
  connection.release();
  await getPool().end();
}
