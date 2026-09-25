import "server-only";
import type { z } from "zod";

import {
  isAbortError,
  wordpressAuthedFetch,
  wordpressPublicFetch,
} from "@/lib/wordpress/client";
import { wpMediaSchema } from "@/lib/wordpress/schemas";

import { SECTION_META_KEY } from "./meta-key";
import type {
  ImageRef,
  ResolvedImage,
  SectionSaveResult,
  SectionSlug,
} from "./types";

const SECTIONS_TAG = "wp:sections";
// INTERIM: same 60s stopgap as article reads, pending the DEC-105 webhook.
const SECTIONS_REVALIDATE_SECONDS = 60;
const SAVE_TIMEOUT_MS = 15_000;

interface SectionPage {
  id: number;
  data: unknown;
  modifiedAt: string | null;
}

async function fetchSectionPage(
  slug: SectionSlug,
): Promise<SectionPage | null> {
  let response: Response;
  try {
    response = await wordpressPublicFetch(
      `/pages?slug=${slug}&status=publish&per_page=1&_fields=id,meta,modified_gmt`,
      {
        revalidate: SECTIONS_REVALIDATE_SECONDS,
        tags: [SECTIONS_TAG, `wp:section:${slug}`],
      },
    );
  } catch {
    return null;
  }
  if (!response.ok) return null;

  const pages = (await response.json()) as Array<{
    id: number;
    meta?: Record<string, string>;
    modified_gmt?: string;
  }>;
  const page = pages[0];
  if (!page) return null;

  const raw = page.meta?.[SECTION_META_KEY];
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  return {
    id: page.id,
    data,
    modifiedAt: page.modified_gmt ? `${page.modified_gmt}Z` : null,
  };
}

/** Every section save affects the single-page public site the same way — see publish-actions.ts for the article equivalent. */
async function saveSectionRaw(
  slug: SectionSlug,
  jsonValue: unknown,
): Promise<SectionSaveResult> {
  const existing = await fetchSectionPage(slug);
  if (!existing) {
    return {
      status: "error",
      message: `Section page "${slug}" was not found in WordPress. Run "pnpm wp:seed-content" first.`,
    };
  }

  let response: Response;
  try {
    response = await wordpressAuthedFetch(`/pages/${existing.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meta: { [SECTION_META_KEY]: JSON.stringify(jsonValue) },
      }),
      timeoutMs: SAVE_TIMEOUT_MS,
    });
  } catch (error) {
    if (isAbortError(error)) {
      return {
        status: "uncertain",
        message:
          "Saving timed out. WordPress may have still saved the change — reload before retrying.",
      };
    }
    return {
      status: "error",
      message: "Could not reach WordPress to save this section.",
    };
  }

  if (!response.ok) {
    return { status: "error", message: "WordPress rejected the change." };
  }

  return { status: "success", cacheWarning: false };
}

async function resolveImageRef(
  ref: ImageRef,
  fallback: ResolvedImage,
): Promise<ResolvedImage> {
  if (!ref.mediaId) return fallback;

  let response: Response;
  try {
    response = await wordpressPublicFetch(`/media/${ref.mediaId}`, {
      revalidate: SECTIONS_REVALIDATE_SECONDS,
      tags: [SECTIONS_TAG],
    });
  } catch {
    return fallback;
  }
  if (!response.ok) return fallback;

  const parsed = wpMediaSchema.safeParse(await response.json());
  if (!parsed.success) return fallback;

  return {
    mediaId: ref.mediaId,
    url: parsed.data.source_url,
    alt: ref.alt || fallback.alt,
  };
}

export interface SectionAdapter<T> {
  slug: SectionSlug;
  schema: z.ZodType<T>;
  defaults: T;
  get: () => Promise<T>;
  getLastModified: () => Promise<string | null>;
  save: (data: T) => Promise<SectionSaveResult>;
}

/** Text-only sections: the validated/defaults shape is also the render shape. */
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
      if (!page) return defaults;
      const parsed = schema.safeParse(page.data);
      return parsed.success ? parsed.data : defaults;
    },
    async getLastModified() {
      const page = await fetchSectionPage(slug);
      return page?.modifiedAt ?? null;
    },
    async save(data: T) {
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        return {
          status: "validation_error",
          fieldErrors: zodIssuesToFieldErrors(parsed.error),
        };
      }
      return saveSectionRaw(slug, parsed.data);
    },
  };
}

export function zodIssuesToFieldErrors(
  error: z.ZodError,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!fieldErrors[path]) fieldErrors[path] = issue.message;
  }
  return fieldErrors;
}

export { fetchSectionPage, resolveImageRef, saveSectionRaw };
