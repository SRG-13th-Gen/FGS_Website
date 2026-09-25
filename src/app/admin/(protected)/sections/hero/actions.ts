"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import type { HeroContent } from "@/lib/wordpress/sections/hero";
import { heroContent } from "@/lib/wordpress/sections/content";
import { uploadSectionImage } from "@/lib/wordpress/sections/media";
import type { SectionSaveResult } from "@/lib/wordpress/sections/types";

export async function saveHeroAction(
  _prevState: SectionSaveResult | null,
  formData: FormData,
): Promise<SectionSaveResult> {
  await requireAdmin();

  const alt = String(formData.get("backgroundImageAlt") ?? "");
  let mediaId = Number(formData.get("backgroundImageMediaId") ?? 0);

  const file = formData.get("backgroundImageFile");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadSectionImage(file, alt);
    if ("error" in uploaded) {
      return { status: "error", message: uploaded.error };
    }
    mediaId = uploaded.mediaId;
  }

  const input: HeroContent = {
    heading: String(formData.get("heading") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    backgroundImage: { mediaId, alt },
  };

  const result = await heroContent.save(input);
  if (result.status !== "success") return result;

  let cacheWarning = false;
  try {
    revalidatePath("/");
  } catch {
    cacheWarning = true;
  }
  return { ...result, cacheWarning };
}
