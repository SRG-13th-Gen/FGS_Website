import "server-only";
import { rows } from "./db";
import { mediaUrl, pageNumber, searchPattern } from "./media";
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
  search: string;
  page: number;
}
export async function listMediaLibrary(
  query: MediaLibraryQuery,
): Promise<MediaLibraryListResult> {
  try {
    const page = pageNumber(query.page);
    const where =
      "mime_type LIKE 'image/%' AND NOT EXISTS (SELECT 1 FROM media_variants v WHERE v.media_id = media.id) AND (filename LIKE ? OR alt LIKE ?)";
    const params = [searchPattern(query.search), searchPattern(query.search)];
    const [count] = await rows(
      "SELECT COUNT(*) AS total FROM media WHERE " + where,
      params,
    );
    const items = await rows(
      "SELECT id, path, alt FROM media WHERE " +
        where +
        " ORDER BY created_at DESC, id DESC LIMIT " +
        MEDIA_LIBRARY_PAGE_SIZE +
        " OFFSET " +
        (page - 1) * MEDIA_LIBRARY_PAGE_SIZE,
      params,
    );
    const total = Number(count.total);
    return {
      status: "ok",
      items: items.map((m) => ({
        id: Number(m.id),
        url: mediaUrl(m.path),
        alt: m.alt,
      })),
      page,
      total,
      totalPages: Math.ceil(total / MEDIA_LIBRARY_PAGE_SIZE),
    };
  } catch {
    return { status: "unavailable" };
  }
}
