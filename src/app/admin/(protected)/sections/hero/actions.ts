"use server";

import { revalidatePath } from "next/cache";

import {
  checkSectionRevision,
  zodIssuesToFieldErrors,
} from "@/lib/content/sections/adapter";

import { requireAdmin } from "@/lib/auth/require-admin";
import type { HeroContent } from "@/lib/content/sections/hero";
import { heroContent } from "@/lib/content/sections/content";
import { uploadSectionImage } from "@/lib/content/sections/media";
import type { SectionSaveResult } from "@/lib/content/sections/types";

export async function saveHeroAction(
  _prevState: SectionSaveResult | null,
  formData: FormData,
): Promise<SectionSaveResult> {
  await requireAdmin();
  const revisionError = await checkSectionRevision(
    "site-hero",
    Number(formData.get("revision")),
  );
  if (revisionError) return { status: "error", message: revisionError };

  const alt = String(formData.get("backgroundImageAlt") ?? "");
  const mediaId = Number(formData.get("backgroundImageMediaId") ?? 0);

  const input: HeroContent = {
    heading: String(formData.get("heading") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    backgroundImage: { mediaId, alt },
  };

  const file = formData.get("backgroundImageFile");
  const draft = structuredClone(input);
  if (file instanceof File && file.size > 0) draft.backgroundImage.mediaId = 1;
  const parsed = heroContent.schema.safeParse(draft);
  if (!parsed.success)
    return {
      status: "validation_error",
      fieldErrors: zodIssuesToFieldErrors(parsed.error),
    };
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadSectionImage(file, alt);
    if ("error" in uploaded) {
      return { status: "error", message: uploaded.error };
    }
    input.backgroundImage.mediaId = uploaded.mediaId;
  }

  const result = await heroContent.save(
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
  return { ...result, cacheWarning };
}
