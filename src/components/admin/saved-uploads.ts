import type { ImageFieldValue } from "@/components/admin/fields";

/**
 * After a successful save, swap each uploaded slot's pending file for the
 * stored media id. The form then submits a plain reference and the same file
 * is never uploaded twice. Slots without an upload are returned unchanged.
 */
export function applySavedUploads<T extends ImageFieldValue>(
  items: T[],
  uploadedMedia: Record<number, number> | undefined,
): T[] {
  if (!uploadedMedia) return items;
  return items.map((item, index) => {
    const mediaId = uploadedMedia[index];
    return item.pendingFile && mediaId
      ? { ...item, mediaId, pendingFile: null }
      : item;
  });
}
