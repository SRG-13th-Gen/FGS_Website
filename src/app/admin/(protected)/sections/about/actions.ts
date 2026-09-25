"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import type { AboutContent } from "@/lib/wordpress/sections/about";
import { aboutContent } from "@/lib/wordpress/sections/content";
import { uploadSectionImage } from "@/lib/wordpress/sections/media";
import type { SectionSaveResult } from "@/lib/wordpress/sections/types";

export async function saveAboutAction(
  _prevState: SectionSaveResult | null,
  formData: FormData,
): Promise<SectionSaveResult> {
  await requireAdmin();

  const bannerAlt = String(formData.get("bannerImageAlt") ?? "");
  let bannerMediaId = Number(formData.get("bannerImageMediaId") ?? 0);

  const file = formData.get("bannerImageFile");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadSectionImage(file, bannerAlt);
    if ("error" in uploaded) {
      return { status: "error", message: uploaded.error };
    }
    bannerMediaId = uploaded.mediaId;
  }

  const storyParagraphs = formData
    .getAll("storyParagraphs")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const input: AboutContent = {
    sectionLabel: String(formData.get("sectionLabel") ?? ""),
    heading: String(formData.get("heading") ?? ""),
    storyParagraphs,
    mission: String(formData.get("mission") ?? ""),
    vision: String(formData.get("vision") ?? ""),
    quote: {
      text: String(formData.get("quoteText") ?? ""),
      author: String(formData.get("quoteAuthor") ?? ""),
    },
    featureBanner: {
      heading: String(formData.get("bannerHeading") ?? ""),
      body: String(formData.get("bannerBody") ?? ""),
      image: { mediaId: bannerMediaId, alt: bannerAlt },
    },
  };

  const result = await aboutContent.save(input);
  if (result.status !== "success") return result;

  let cacheWarning = false;
  try {
    revalidatePath("/");
  } catch {
    cacheWarning = true;
  }
  return { ...result, cacheWarning };
}
