import "server-only";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdir,
  writeFile,
  readFile,
  realpath,
  rename,
  rm,
} from "node:fs/promises";
import path from "node:path";
import { rows, mutate } from "./db";
import { getServerEnvironment } from "@/lib/env/server";
import { sniffImageMimeType } from "./image-type";
export function mediaUrl(filePath: string): string {
  return "/media/" + filePath.split("/").map(encodeURIComponent).join("/");
}
export function mediaRoot(): string {
  const configured = getServerEnvironment().MEDIA_STORAGE_PATH;
  if (!configured) throw new Error("Media storage is not configured.");
  const root = path.resolve(configured);
  if (
    process.env.NODE_ENV === "production" &&
    /(^|[\\/])(public_html|nodejs|\.next)([\\/]|$)/.test(root)
  )
    throw new Error("Media storage must be outside deployment directories.");
  return root;
}
export function safeMediaPath(root: string, segments: string[]): string {
  if (
    !segments.length ||
    segments.some(
      (s) => !/^[a-zA-Z0-9_.-]+$/.test(s) || s === "." || s === "..",
    )
  )
    throw new Error("Invalid media path.");
  const result = path.resolve(root, ...segments);
  if (!result.startsWith(path.resolve(root) + path.sep))
    throw new Error("Invalid media path.");
  return result;
}
export async function readMediaFile(filePath: string): Promise<Buffer> {
  const root = await realpath(mediaRoot());
  const target = await realpath(safeMediaPath(root, filePath.split("/")));
  if (!target.startsWith(root + path.sep))
    throw new Error("Invalid media path.");
  return readFile(target);
}
export async function getMedia(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const [item] = await rows("SELECT * FROM media WHERE id = ?", [id]);
  return item
    ? {
        ...item,
        id: Number(item.id),
        url: mediaUrl(item.path),
        alt: String(item.alt),
        caption: String(item.caption),
        mime_type: String(item.mime_type),
      }
    : null;
}
export async function uploadMedia(file: File, alt: string, caption = "") {
  if (!file.size || file.size > 10 * 1024 * 1024)
    throw new Error("Choose an image of up to 10 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = sniffImageMimeType(bytes);
  if (!mime) throw new Error("Choose a JPEG, PNG, WebP, or AVIF image.");
  const checksum = createHash("sha256").update(bytes).digest("hex");
  const filePath =
    checksum.slice(0, 2) + "/" + checksum + "." + mime.split("/")[1];
  const target = safeMediaPath(mediaRoot(), filePath.split("/"));
  await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
  let complete = false;
  try {
    complete =
      createHash("sha256")
        .update(await readFile(target))
        .digest("hex") === checksum;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (!complete) {
    // Same-directory rename exposes only complete bytes. Identical concurrent
    // uploads can replace each other safely; retries also repair old partial files.
    const temporary = target + "." + randomUUID() + ".part";
    try {
      await writeFile(temporary, bytes, { flag: "wx", mode: 0o600 });
      try {
        await rename(temporary, target);
      } catch (error) {
        // Windows may deny replacing a file another upload just published.
        // Accept that race only after verifying the complete destination bytes.
        if (
          !["EPERM", "EEXIST", "EACCES"].includes(
            (error as NodeJS.ErrnoException).code ?? "",
          )
        )
          throw error;
        let identical = false;
        try {
          identical =
            createHash("sha256")
              .update(await readFile(target))
              .digest("hex") === checksum;
        } catch {
          // Preserve the original publication error if no complete file exists.
        }
        if (!identical) throw error;
      }
    } finally {
      await rm(temporary, { force: true });
    }
  }
  const existing = await rows("SELECT id FROM media WHERE path = ?", [
    filePath,
  ]);
  if (existing[0])
    return { mediaId: Number(existing[0].id), url: mediaUrl(filePath) };
  // A simultaneous identical upload reuses the same immutable file and row.
  await mutate(
    "INSERT INTO media (path, filename, mime_type, size_bytes, checksum, alt, caption) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = id",
    [
      filePath,
      path.basename(file.name).slice(0, 255),
      mime,
      bytes.length,
      checksum,
      alt.slice(0, 2000),
      caption.slice(0, 5000),
    ],
  );
  const [item] = await rows("SELECT id FROM media WHERE path = ?", [filePath]);
  return { mediaId: Number(item.id), url: mediaUrl(filePath) };
}
export function pageNumber(page: number): number {
  return Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100000) : 1;
}
export function searchPattern(search: string): string {
  return "%" + search.slice(0, 200).replace(/[\\%_]/g, (c) => "\\" + c) + "%";
}
