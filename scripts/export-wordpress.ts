import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { loadEnvironment } from "./environment";
import { safeSourceUrl } from "./migration/normalize";
import {
  snapshotSchema,
  resourceSchema,
  type MigrationSnapshot,
} from "./migration/snapshot";
await loadEnvironment();
const output = path.resolve(
  process.argv[2] ?? ".data/migration/" + new Date().toISOString().slice(0, 10),
);
if (
  !output.includes(path.sep + ".data" + path.sep) &&
  !output.includes(path.sep + "backups" + path.sep)
)
  throw new Error("Export into ignored .data or backups storage.");
const cms = process.env.WORDPRESS_URL;
if (
  !cms ||
  !process.env.WORDPRESS_USERNAME ||
  !process.env.WORDPRESS_APPLICATION_PASSWORD
)
  throw new Error("Supply CMS credentials through FGS_ENV_FILE.");
const origins = [new URL(cms).origin, "https://flordegraceschoolinc.com"];
await mkdir(path.join(output, "files"), { recursive: true, mode: 0o700 });
const auth =
  "Basic " +
  Buffer.from(
    process.env.WORDPRESS_USERNAME +
      ":" +
      process.env.WORDPRESS_APPLICATION_PASSWORD,
  ).toString("base64");
async function request(url: string, authenticated = false) {
  safeSourceUrl(url, origins);
  const response = await fetch(url, {
    headers: authenticated ? { Authorization: auth } : {},
    redirect: "manual",
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok)
    throw new Error(
      "Source request failed: " + response.status + " " + new URL(url).pathname,
    );
  return response;
}
async function inventory(origin: string, kind: string, authenticated: boolean) {
  const all = [];
  let pages = 1;
  for (let page = 1; page <= pages; page++) {
    const params = new URLSearchParams({ per_page: "100", page: String(page) });
    if (authenticated) {
      params.set("context", "edit");
      params.set(
        "status",
        kind === "media"
          ? "inherit,private,trash"
          : "publish,draft,pending,private,future",
      );
    }
    const response = await request(
      origin + "/wp-json/wp/v2/" + kind + "?" + params,
      authenticated,
    );
    pages = Number(response.headers.get("x-wp-totalpages") ?? 1);
    const items = zArray(await response.json());
    all.push(...items);
  }
  return all;
}
function zArray(input: unknown) {
  if (!Array.isArray(input)) throw new Error("Invalid source inventory.");
  return input.map((i) => resourceSchema.parse(i));
}
const snapshot: MigrationSnapshot = {
  version: 1,
  createdAt: new Date().toISOString(),
  origins,
  posts: [],
  pages: [],
  media: [],
  sourceInventories: [],
  files: [],
};
for (const origin of origins) {
  const authenticated = origin === origins[0];
  const [posts, pages, media] = await Promise.all(
    ["posts", "pages", "media"].map((k) => inventory(origin, k, authenticated)),
  );
  snapshot.sourceInventories.push({
    origin,
    posts: posts.length,
    pages: pages.length,
    media: media.length,
  });
  for (const [destination, source] of [
    [snapshot.posts, posts],
    [snapshot.pages, pages],
    [snapshot.media, media],
  ])
    for (const item of source) {
      const existing = destination.find((v) => v.id === item.id);
      // Prefer the independent CMS's editorial updates; preserve both complete inventories separately.
      if (!existing) destination.push(item);
    }
  await writeFile(
    path.join(output, new URL(origin).hostname + ".json"),
    JSON.stringify({ posts, pages, media }, null, 2),
    { mode: 0o600 },
  );
}
const downloads = new Map<string, string>();
for (const media of snapshot.media) {
  if (media.source_url)
    downloads.set(
      media.source_url,
      media.mime_type ?? "application/octet-stream",
    );
  const sizes = media.media_details?.sizes as
    Record<string, { source_url?: string; mime_type?: string }> | undefined;
  if (sizes)
    for (const size of Object.values(sizes))
      if (size.source_url)
        downloads.set(
          size.source_url,
          size.mime_type ?? media.mime_type ?? "application/octet-stream",
        );
  const original = media.media_details?.original_image;
  if (typeof original === "string" && media.source_url)
    downloads.set(
      new URL(original, media.source_url).href,
      media.mime_type ?? "application/octet-stream",
    );
}
for (const post of snapshot.posts) {
  const raw = post.content?.raw ?? post.content?.rendered ?? "";
  const matches = raw.matchAll(
    /(?:src|href)=["'](https:\/\/[^"']+\/wp-content\/uploads\/[^"']+)["']/g,
  );
  for (const match of matches)
    downloads.set(match[1], "application/octet-stream");
}
const jobs = [...downloads.entries()];
let cursor = 0;
const errors: string[] = [];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (cursor < jobs.length) {
      const [url, mime] = jobs[cursor++];
      try {
        safeSourceUrl(url, origins);
        const identity = createHash("sha256").update(url).digest("hex");
        const extension =
          /\.[a-z0-9]{1,8}$/i.exec(new URL(url).pathname)?.[0].toLowerCase() ??
          ".bin";
        const relative = "files/" + identity + extension;
        const target = path.join(output, relative);
        let bytes: Buffer;
        try {
          bytes = await readFile(target);
        } catch {
          let response: Response;
          try {
            response = await request(url);
          } catch {
            const candidate = new URL(url);
            if (!/\/\d{4}\/\d{2}\/elementor\/thumbs\//.test(candidate.pathname))
              throw new Error("Missing source asset.");
            candidate.pathname = candidate.pathname.replace(
              /\/\d{4}\/\d{2}(?=\/elementor\/thumbs\/)/,
              "",
            );
            try {
              response = await request(candidate.href);
            } catch {
              candidate.pathname = new URL(url).pathname.replace(
                "/elementor/thumbs/",
                "/",
              );
              response = await request(candidate.href);
            }
          }
          if (
            Number(response.headers.get("content-length") ?? 0) >
            150 * 1024 * 1024
          )
            throw new Error("Oversized source file.");
          bytes = Buffer.from(await response.arrayBuffer());
          if (bytes.length > 150 * 1024 * 1024)
            throw new Error("Oversized source file.");
          await writeFile(target + ".part", bytes, { mode: 0o600 });
          await rename(target + ".part", target);
        }
        snapshot.files.push({
          url,
          path: relative,
          checksum: createHash("sha256").update(bytes).digest("hex"),
          bytes: bytes.length,
          mime,
        });
        if (snapshot.files.length % 100 === 0)
          console.log("Exported " + snapshot.files.length + " assets.");
      } catch {
        errors.push(url);
      }
    }
  }),
);
await writeFile(
  path.join(output, "export-report.json"),
  JSON.stringify(
    {
      inventories: snapshot.sourceInventories,
      files: snapshot.files.length,
      failed: errors,
    },
    null,
    2,
  ),
  { mode: 0o600 },
);
snapshotSchema.parse(snapshot);
await writeFile(
  path.join(output, "snapshot.json"),
  JSON.stringify(snapshot, null, 2),
  { mode: 0o600 },
);
console.log(
  JSON.stringify({
    posts: snapshot.posts.length,
    pages: snapshot.pages.length,
    media: snapshot.media.length,
    files: snapshot.files.length,
    failed: errors.length,
  }),
);
if (errors.length) process.exitCode = 1;
