"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  checkSectionRevision,
  zodIssuesToFieldErrors,
} from "@/lib/content/sections/adapter";
import type { AlumniContent } from "@/lib/content/sections/alumni";
import { alumniContent } from "@/lib/content/sections/content";
import { uploadSectionImage } from "@/lib/content/sections/media";
import type { SectionSaveResult } from "@/lib/content/sections/types";
import { validateImageFile } from "@/lib/content/validation";

const MAX_ACHIEVEMENTS = 24;

const submittedAchievements = z
  .array(
    z.object({
      name: z.string(),
      batch: z.string(),
      title: z.string(),
      description: z.string(),
      // Present only when a photo is set; a new upload has mediaId 0.
      image: z
        .object({
          mediaId: z.number().int().nonnegative(),
          alt: z.string(),
        })
        .optional(),
    }),
  )
  .max(MAX_ACHIEVEMENTS);

export async function saveAlumniAction(
  _prevState: SectionSaveResult | null,
  formData: FormData,
): Promise<SectionSaveResult> {
  await requireAdmin();
  const revision = Number(formData.get("revision"));
  const conflict = await checkSectionRevision("site-alumni", revision);
  if (conflict) return { status: "error", message: conflict };
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("achievementsJson") ?? "[]"));
  } catch {
    return {
      status: "validation_error",
      fieldErrors: { achievements: "Enter valid achievements." },
    };
  }
  const achievements = submittedAchievements.safeParse(raw);
  if (!achievements.success)
    return {
      status: "validation_error",
      fieldErrors: {
        achievements: `Enter up to ${MAX_ACHIEVEMENTS} valid achievements.`,
      },
    };
  const input: AlumniContent = {
    sectionLabel: String(formData.get("sectionLabel") ?? ""),
    heading: String(formData.get("heading") ?? ""),
    intro: String(formData.get("intro") ?? ""),
    achievements: achievements.data,
  };
  // Validate the whole section (including alt text) before any upload; a new
  // photo carries a placeholder media id until it is stored.
  const draft = structuredClone(input);
  let totalBytes = 0;
  for (let i = 0; i < draft.achievements.length; i++) {
    const file = formData.get(`achievementFile-${i}`);
    if (file instanceof File && file.size > 0) {
      totalBytes += file.size;
      const error = await validateImageFile(String(i), file);
      if (error) return { status: "error", message: error.message };
      const image = draft.achievements[i].image;
      draft.achievements[i].image = { mediaId: 1, alt: image?.alt ?? "" };
    }
  }
  if (totalBytes > 60 * 1024 * 1024)
    return {
      status: "error",
      message: "New images must total no more than 60 MB.",
    };
  const parsed = alumniContent.schema.safeParse(draft);
  if (!parsed.success)
    return {
      status: "validation_error",
      fieldErrors: zodIssuesToFieldErrors(parsed.error),
    };
  const uploadedMedia: Record<number, number> = {};
  for (let i = 0; i < input.achievements.length; i++) {
    const file = formData.get(`achievementFile-${i}`);
    if (file instanceof File && file.size > 0) {
      const alt = draft.achievements[i].image?.alt.trim() ?? "";
      const uploaded = await uploadSectionImage(file, alt);
      if ("error" in uploaded)
        return { status: "error", message: uploaded.error };
      input.achievements[i].image = { mediaId: uploaded.mediaId, alt };
      uploadedMedia[i] = uploaded.mediaId;
    }
  }
  const result = await alumniContent.save(input, revision);
  if (result.status !== "success") return result;
  const saved = { ...result, uploadedMedia };
  try {
    revalidatePath("/alumni");
    return saved;
  } catch {
    return { ...saved, cacheWarning: true };
  }
}
