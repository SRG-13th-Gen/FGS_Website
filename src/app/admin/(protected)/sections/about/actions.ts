"use server";

import { revalidatePath } from "next/cache";

import {
  checkSectionRevision,
  zodIssuesToFieldErrors,
} from "@/lib/content/sections/adapter";

import { requireAdmin } from "@/lib/auth/require-admin";
import type { AboutContent } from "@/lib/content/sections/about";
import { aboutContent } from "@/lib/content/sections/content";
import { uploadSectionImage } from "@/lib/content/sections/media";
import type { SectionSaveResult } from "@/lib/content/sections/types";

export async function saveAboutAction(
  _prevState: SectionSaveResult | null,
  formData: FormData,
): Promise<SectionSaveResult> {
  await requireAdmin();
  const revisionError = await checkSectionRevision(
    "site-about",
    Number(formData.get("revision")),
  );
  if (revisionError) return { status: "error", message: revisionError };

  const bannerAlt = String(formData.get("bannerImageAlt") ?? "");
  const bannerMediaId = Number(formData.get("bannerImageMediaId") ?? 0);

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

  const file = formData.get("bannerImageFile");
  const draft = structuredClone(input);
  if (file instanceof File && file.size > 0)
    draft.featureBanner.image.mediaId = 1;
  const parsed = aboutContent.schema.safeParse(draft);
  if (!parsed.success)
    return {
      status: "validation_error",
      fieldErrors: zodIssuesToFieldErrors(parsed.error),
    };
  let uploadedMedia: Record<number, number> | undefined;
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadSectionImage(file, bannerAlt);
    if ("error" in uploaded) {
      return { status: "error", message: uploaded.error };
    }
    input.featureBanner.image.mediaId = uploaded.mediaId;
    uploadedMedia = { 0: uploaded.mediaId };
  }

  const result = await aboutContent.save(
    input,
    Number(formData.get("revision")),
  );
  if (result.status !== "success") return result;

  let cacheWarning = false;
  try {
    revalidatePath("/");
  } catch {
    cacheWarning = true;
  }
  return { ...result, cacheWarning, uploadedMedia };
}
