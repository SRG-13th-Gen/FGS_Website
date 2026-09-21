import "server-only";

import { wordpressAuthedFetch } from "@/lib/wordpress/client";
import { wpMediaListSchema } from "@/lib/wordpress/schemas";

export const MEDIA_LIBRARY_PAGE_SIZE = 12;

export interface MediaLibraryItem {
  id: number;
  url: string;
  alt: string;
}

export type MediaLibraryListResult =
  | {
      status: "ok";
      items: MediaLibraryItem[];
      page: number;
      totalPages: number;
      total: number;
    }
  | { status: "unavailable" };

export interface MediaLibraryQuery {
  /** Trimmed search text, or "" for no filter. */
  search: string;
  /** 1-based. */
  page: number;
}

/**
 * Lists WordPress media library items for the admin's "choose from library"
 * picker: images only, newest first, with search and pagination pushed down
 * to the WordPress REST query — never fetch-everything-then-filter. Never
 * called from the browser; always wrapped by a requireAdmin()-gated server
 * action (see src/app/admin/(protected)/media-actions.ts).
 *
 * `media_type=image` is a documented core REST API parameter for /wp/v2/media
 * (reference consulted 2026-09-21:
 * https://developer.wordpress.org/rest-api/reference/media/#arguments).
 */
export async function listMediaLibrary(
  query: MediaLibraryQuery,
): Promise<MediaLibraryListResult> {
  const params = new URLSearchParams({
    media_type: "image",
    status: "inherit",
    per_page: String(MEDIA_LIBRARY_PAGE_SIZE),
    page: String(query.page),
    orderby: "date",
    order: "desc",
    _fields: "id,source_url,alt_text",
  });
  if (query.search) params.set("search", query.search);

  let response: Response;
  try {
    response = await wordpressAuthedFetch(`/media?${params.toString()}`, {
      method: "GET",
    });
  } catch {
    return { status: "unavailable" };
  }
  if (!response.ok) return { status: "unavailable" };

  const total = Number(response.headers.get("X-WP-Total") ?? 0);
  const totalPages = Number(response.headers.get("X-WP-TotalPages") ?? 0);

  const parsed = wpMediaListSchema.safeParse(await response.json());
  if (!parsed.success) return { status: "unavailable" };

  const items = parsed.data.map((media) => ({
    id: media.id,
    url: media.source_url,
    alt: media.alt_text || "",
  }));

  return { status: "ok", items, page: query.page, totalPages, total };
}
