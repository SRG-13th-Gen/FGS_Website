"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  checkSectionRevision,
  zodIssuesToFieldErrors,
} from "@/lib/content/sections/adapter";
import { galleryContent } from "@/lib/content/sections/content";
import { uploadSectionImage } from "@/lib/content/sections/media";
import type { GalleryContent } from "@/lib/content/sections/gallery";
import type { SectionSaveResult } from "@/lib/content/sections/types";
import { validateImageFile } from "@/lib/content/validation";

export async function saveGalleryAction(
  _prevState: SectionSaveResult | null,
  formData: FormData,
): Promise<SectionSaveResult> {
  await requireAdmin();
  const revision = Number(formData.get("revision"));
  const conflict = await checkSectionRevision("site-gallery", revision);
  if (conflict) return { status: "error", message: conflict };
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("photosJson") ?? "[]"));
  } catch {
    return {
      status: "validation_error",
      fieldErrors: { photos: "Choose valid photos." },
    };
  }
  const photos = z
    .array(
      z.object({
        mediaId: z.number().int().nonnegative(),
        alt: z.string(),
        caption: z.string(),
      }),
    )
    .max(30)
    .safeParse(raw);
  if (!photos.success)
    return {
      status: "validation_error",
      fieldErrors: { photos: "Choose up to 30 valid photos." },
    };
  const input: GalleryContent = {
    sectionLabel: String(formData.get("sectionLabel") ?? ""),
    heading: String(formData.get("heading") ?? ""),
    intro: String(formData.get("intro") ?? ""),
    photos: photos.data.map((photo) => ({
      image: { mediaId: photo.mediaId, alt: photo.alt },
      caption: photo.caption,
    })),
  };
  const draft = structuredClone(input);
  let totalBytes = 0;
  for (let i = 0; i < draft.photos.length; i++) {
    const file = formData.get(`photoFile-${i}`);
    if (file instanceof File && file.size > 0) {
      totalBytes += file.size;
      const error = await validateImageFile(String(i), file);
      if (error) return { status: "error", message: error.message };
      draft.photos[i].image.mediaId = 1;
    }
  }
  if (totalBytes > 60 * 1024 * 1024)
    return {
      status: "error",
      message: "New images must total no more than 60 MB.",
    };
  const parsed = galleryContent.schema.safeParse(draft);
  if (!parsed.success)
    return {
      status: "validation_error",
      fieldErrors: zodIssuesToFieldErrors(parsed.error),
    };
  for (let i = 0; i < input.photos.length; i++) {
    const file = formData.get(`photoFile-${i}`);
    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadSectionImage(
        file,
        input.photos[i].image.alt,
      );
      if ("error" in uploaded)
        return { status: "error", message: uploaded.error };
      input.photos[i].image.mediaId = uploaded.mediaId;
    }
  }
  const result = await galleryContent.save(input, revision);
  if (result.status !== "success") return result;
  try {
    revalidatePath("/");
    return result;
  } catch {
    return { ...result, cacheWarning: true };
  }
}
