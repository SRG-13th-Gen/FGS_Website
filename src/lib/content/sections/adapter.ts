import "server-only";
import { cache } from "react";
import type { z } from "zod";
import { rows, mutate, isoDate } from "../db";
import { getMedia } from "../media";
import type {
  ImageRef,
  ResolvedImage,
  SectionSaveResult,
  SectionSlug,
} from "./types";
export const fetchSectionPage = cache(async (slug: SectionSlug) => {
  try {
    const [row] = await rows(
      "SELECT slug, data, revision, modified_at FROM sections WHERE slug = ?",
      [slug],
    );
    if (!row) return null;
    return {
      data: typeof row.data === "string" ? JSON.parse(row.data) : row.data,
      revision: Number(row.revision),
      modifiedAt: isoDate(row.modified_at),
    };
  } catch {
    return null;
  }
});
export async function getSectionRevision(slug: SectionSlug): Promise<number> {
  return (await fetchSectionPage(slug))?.revision ?? 0;
}
export async function checkSectionRevision(
  slug: SectionSlug,
  expectedRevision: number,
): Promise<string | null> {
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1)
    return "Content is unavailable. Reload before saving.";
  try {
    const [row] = await rows("SELECT revision FROM sections WHERE slug = ?", [
      slug,
    ]);
    return row && Number(row.revision) === expectedRevision
      ? null
      : "This section changed since you opened it. Reload to review the latest version.";
  } catch {
    return "Content is unavailable. Please try again shortly.";
  }
}
export async function saveSectionRaw(
  slug: SectionSlug,
  data: unknown,
  expectedRevision: number,
): Promise<SectionSaveResult> {
  if (!Number.isInteger(expectedRevision) || expectedRevision < 1)
    return {
      status: "error",
      message: "Content is unavailable. Reload before saving.",
    };
  try {
    const ids = new Set<number>();
    function collect(value: unknown) {
      if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === "object")
        for (const [key, item] of Object.entries(value)) {
          if (key === "mediaId") {
            if (!Number.isSafeInteger(item) || Number(item) < 1)
              throw new Error("Invalid media reference.");
            ids.add(Number(item));
          } else collect(item);
        }
    }
    collect(data);
    if (ids.size) {
      const found = await rows(
        "SELECT id FROM media WHERE mime_type LIKE 'image/%' AND id IN (" +
          Array.from(ids)
            .map(() => "?")
            .join(",") +
          ")",
        Array.from(ids),
      );
      if (found.length !== ids.size)
        return {
          status: "error",
          message: "An image is unavailable. Choose it again before saving.",
        };
    }
    const result = await mutate(
      "UPDATE sections SET data = ?, revision = revision + 1, modified_at = UTC_TIMESTAMP(3) WHERE slug = ? AND revision = ?",
      [JSON.stringify(data), slug, expectedRevision],
    );
    if (!result.affectedRows)
      return {
        status: "error",
        message:
          "This section changed since you opened it. Reload to review the latest version.",
      };
    return {
      status: "success",
      cacheWarning: false,
      revision: expectedRevision + 1,
    };
  } catch {
    return {
      status: "uncertain",
      message:
        "The save could not be confirmed. Reload to check the content before retrying.",
    };
  }
}
export async function resolveImageRef(
  ref: ImageRef,
  fallback: ResolvedImage,
): Promise<ResolvedImage> {
  try {
    const item = await getMedia(ref.mediaId);
    return item
      ? { mediaId: item.id, url: item.url, alt: ref.alt || fallback.alt }
      : fallback;
  } catch {
    return fallback;
  }
}
export interface SectionAdapter<T> {
  slug: SectionSlug;
  schema: z.ZodType<T>;
  defaults: T;
  get: () => Promise<T>;
  getLastModified: () => Promise<string | null>;
  save: (data: T, expectedRevision: number) => Promise<SectionSaveResult>;
}
export function createSectionAdapter<T>(
  slug: SectionSlug,
  schema: z.ZodType<T>,
  defaults: T,
): SectionAdapter<T> {
  return {
    slug,
    schema,
    defaults,
    async get() {
      const page = await fetchSectionPage(slug);
      const parsed = schema.safeParse(page?.data);
      return parsed.success ? parsed.data : defaults;
    },
    async getLastModified() {
      return (await fetchSectionPage(slug))?.modifiedAt ?? null;
    },
    async save(data, expectedRevision) {
      const parsed = schema.safeParse(data);
      return parsed.success
        ? saveSectionRaw(slug, parsed.data, expectedRevision)
        : {
            status: "validation_error",
            fieldErrors: zodIssuesToFieldErrors(parsed.error),
          };
    },
  };
}
export function zodIssuesToFieldErrors(
  error: z.ZodError,
): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((i) => [i.path.join(".") || "_root", i.message]),
  );
}
