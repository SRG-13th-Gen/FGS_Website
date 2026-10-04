import { rows } from "@/lib/content/db";
import { readMediaFile } from "@/lib/content/media";
import { isSafeSvg } from "@/lib/content/svg";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (
    !path.length ||
    path.some(
      (segment) =>
        !/^[a-zA-Z0-9_.-]+$/.test(segment) ||
        segment === "." ||
        segment === "..",
    )
  )
    return new Response(null, { status: 404 });
  try {
    const filePath = path.join("/");
    const [item] = await rows(
      "SELECT mime_type, checksum, filename FROM media WHERE path = ?",
      [filePath],
    );
    if (!item) return new Response(null, { status: 404 });
    const etag = '"' + item.checksum + '"';
    if (request.headers.get("if-none-match") === etag)
      return new Response(null, { status: 304, headers: { ETag: etag } });
    const bytes = await readMediaFile(filePath);
    const safeInline =
      (item.mime_type === "image/svg+xml" && isSafeSvg(bytes)) ||
      [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        "image/gif",
      ].includes(item.mime_type);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": safeInline
          ? item.mime_type
          : "application/octet-stream",
        "Content-Length": String(bytes.length),
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": safeInline ? "inline" : "attachment",
        "Cache-Control": "public, max-age=31536000, immutable, no-transform",
        ETag: etag,
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === "ENOENT" ||
      (error as Error).message === "Invalid media path."
    )
      return new Response(null, { status: 404 });
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
