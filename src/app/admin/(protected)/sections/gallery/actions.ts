"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import type { GalleryContent } from "@/lib/wordpress/sections/gallery";
import { galleryContent } from "@/lib/wordpress/sections/content";
import { uploadSectionImage } from "@/lib/wordpress/sections/media";
import type { SectionSaveResult } from "@/lib/wordpress/sections/types";

function parseJsonField<T>(formData: FormData, name: string, fallback: T): T {
  const raw = formData.get(name);
  if (typeof raw !== "string" || !raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveGalleryAction(
  _prevState: SectionSaveResult | null,
  formData: FormData,
): Promise<SectionSaveResult> {
  await requireAdmin();

  const photoInputs = parseJsonField<
    Array<{ mediaId: number; alt: string; caption: string }>
  >(formData, "photosJson", []);

  const photos: GalleryContent["photos"] = [];
  for (let i = 0; i < photoInputs.length; i++) {
    const photoInput = photoInputs[i];
    let mediaId = photoInput.mediaId;

    const file = formData.get(`photoFile-${i}`);
    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadSectionImage(file, photoInput.alt);
      if ("error" in uploaded) {
        return { status: "error", message: uploaded.error };
      }
      mediaId = uploaded.mediaId;
    }

    photos.push({
      image: { mediaId, alt: photoInput.alt },
      caption: photoInput.caption,
    });
  }

  const input: GalleryContent = {
    sectionLabel: String(formData.get("sectionLabel") ?? ""),
    heading: String(formData.get("heading") ?? ""),
    intro: String(formData.get("intro") ?? ""),
    photos,
  };

  const result = await galleryContent.save(input);
  if (result.status !== "success") return result;

  let cacheWarning = false;
  try {
    revalidatePath("/");
  } catch {
    cacheWarning = true;
  }
  return { ...result, cacheWarning };
}
