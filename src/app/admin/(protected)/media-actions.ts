"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  listMediaLibrary,
  type MediaLibraryListResult,
  type MediaLibraryQuery,
} from "@/lib/wordpress/media-library";

/**
 * Shared by every image field's "Choose from library" tab (section images,
 * gallery photos, article photos, school logo) — see
 * src/components/admin/media-picker.tsx. Not tied to any one admin route.
 */
export async function listMediaAction(
  query: MediaLibraryQuery,
): Promise<MediaLibraryListResult> {
  await requireAdmin();
  return listMediaLibrary(query);
}
